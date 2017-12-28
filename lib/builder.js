'use strict'

const _ = require('lodash')
const sprintf = require('sprintf-js').sprintf
const vsprintf = require('sprintf-js').vsprintf
const defaultTemplate = require('../template/messages')

const LOCATIONS = ['params', 'query', 'body', 'headers', 'cookies']

class WalterBuilder {
  constructor (options) {
    this._fresh = false
    this._location = null
    this._cherryPick = false

    this._omit = []
    this._fields = []
    this._unstricts = []
    this._addedRules = {}
    this._mixLocations = {}

    this.options = options || {}

    _.defaults(this.options, {
      model: {},
      uuid: false,
      templates: {},
      uuidVersion: 5
    })

    Object.assign(
      this.options.templates,
      _.omit(defaultTemplate, _.keys(this.options.templates))
    )

    if (_.isEmpty(this.options.model)) {
      this.validationSchema = {}
    } else {
      let mongooseSchema = _.get(this.options.model, 'schema.obj')

      if (!_.isObject(mongooseSchema)) {
        throw new Error('A valid mongoose model is required in wallter builder.')
      }

      let mapSchema = this.crawl(mongooseSchema)
      this.validationSchema = this.translate(mapSchema)
    }
  }

  crawl (schema, parent = '') {
    let map = {}

    if (_.isNil(schema)) return {}

    Object.keys(schema).forEach(path => {
      map[path] = this.inspect(path, schema[path], parent ? `${parent}.${path}` : path)
      if (_.isNil(map[path])) delete map[path]
    })

    return Object.keys(map).length ? map : {}
  }

  inspect (path, field, absPath = '') {
    if (_.isNil(field)) return null

    let hasType = !_.isNil(field.type) && _.isFunction(field.type)
    let entry = {}

    if (hasType) {
      if (path === 'email') {
        Object.assign(entry, this.mapRule(absPath, 'isEmail'))
      }

      if (this.options.uuid && (path === '_id' || !_.isNil(field.ref))) {
        Object.assign(entry, this.mapRule(absPath, 'isUUID', {
          options: [this.options.uuidVersion]
        }))
      }

      if (!_.isNil(field.unique) && field.unique) {
        Object.assign(entry, this.mapRule(absPath, 'unique', {
          options: [this.options.model.modelName, path]
        }))
      }

      if (!_.isNil(field.required) && field.required) {
        Object.assign(entry, this.mapRule(absPath, 'required'))
      } else {
        entry.optional = true
      }

      if ((!_.isNil(field.minlength) && field.minlength > 0) && (!_.isNil(field.maxlength) && field.maxlength > 0)) {
        Object.assign(entry, this.mapRule(absPath, 'isLength', {
          options: [{min: field.minlength, max: field.maxlength}]
        }))
      } else {
        if (!_.isNil(field.minlength) && field.minlength > 0) {
          Object.assign(entry, this.mapRule(absPath, 'isLength', {
            options: [{min: field.minlength}]
          }))
        }
        if (!_.isNil(field.maxlength) && field.maxlength > 0) {
          Object.assign(entry, this.mapRule(absPath, 'isLength', {
            options: [{max: field.maxlength}]
          }))
        }
      }

      if (!_.isNil(field.enum) && Array.isArray(field.enum) && field.enum.length) {
        Object.assign(entry, this.mapRule(absPath, 'matches', {
          options: [`^(${field.enum.join('|')})$`, 'i', field.enum.join(', ')]
        }))
      }
    } else {
      if (Array.isArray(field)) {
        entry['*'] = this.inspect('*', field[0], `${absPath}.*`)
        if (_.isNil(entry['*'])) delete entry['*']
      } else if (_.isPlainObject(field)) {
        entry = this.crawl(field, absPath)
      } else if (_.isObject(field)) {
        entry = this.crawl(field.obj, absPath || path)
      }
    }

    return (hasType && !_.isEmpty(entry) ? entry : (Object.keys(entry).length ? entry : undefined))
  }

  mapRule (absPath, validationName, misc = {}) {
    let oldOptions = _.clone(misc.options)
    let key = validationName
    let tplKey = key
    let entry = {}

    if (validationName === 'isLength') {
      let opt = misc.options[0]

      if (_.isPlainObject(opt)) {
        if (!_.isNil(opt.min) && !_.isNil(opt.max)) {
          misc.options[1] = opt.min
          misc.options[2] = opt.max
        } else if (!_.isNil(opt.min) && _.isNil(opt.max)) {
          tplKey = 'minlength'
          misc.options[1] = opt.min
        } else if (_.isNil(opt.min) && !_.isNil(opt.max)) {
          tplKey = 'maxlength'
          misc.options[1] = opt.max
        }
      }
    }

    entry[key] = {}

    if (_.isNil(this.options.templates[tplKey])) {
      this.options.templates[tplKey] = `Value for field '%1$s' doesn't meet the specified rule '${key}'`
    }

    if (_.isPlainObject(misc.options)) {
      misc.options.path = absPath
      entry[key].msg = sprintf(this.options.templates[tplKey], misc.options)
      // TODO: options for object??
    } else if (Array.isArray(misc.options) || _.isNil(misc.options)) {
      entry[key].msg = vsprintf(this.options.templates[tplKey], [absPath].concat(misc.options).filter(Boolean))
      if (!_.isEmpty(misc.options)) entry[key].options = oldOptions
    }

    return entry
  }

  translate (mapSchema) {
    let validations = {}
    let self = this

    function __remap (key, schemaEntry) {
      let validation = {}

      Object.keys(schemaEntry).forEach(subkey => {
        if (subkey === 'optional' || self.options.templates[subkey]) {
          if (_.isNil(validation[key])) {
            validation[key] = schemaEntry
          } else {
            Object.assign(validation[key], schemaEntry)
          }
        } else {
          Object.keys(schemaEntry).forEach(subkey => {
            Object.assign(validation, __remap(`${key}.${subkey}`, schemaEntry[subkey]))
          })
        }
      })

      return !_.isEmpty(validation) ? validation : undefined
    }

    Object.keys(mapSchema).forEach(key => {
      Object.assign(validations, __remap(key, mapSchema[key]))
    })

    return validations
  }

  escapeRx (str) {
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  }

  // -- user usable functions

  /**
   * Get specific field from pre generated schema (if mongoose model were attached)
   *
   * @method select
   * @param  {(string|string[])}  paths         path to property to validate
   * @return {self}                             returned self for chaining
   */

  select (paths) {
    if (_.isString(paths)) {
      this._fields.push(paths)
    } else if (Array.isArray(paths)) {
      paths.forEach(path => {
        if (_.isString(path)) {
          this._fields.push(path)
        }
      })
    }

    return this
  }

  /**
   * Remove specific field from pre generated schema (if mongoose model were attached)
   *
   * @method exclude
   * @param  {(string|string[])}  paths         path to property to validate
   * @return {self}                             returned self for chaining
   */

  exclude (paths) {
    if (_.isString(paths)) {
      this._omit.push(paths)
    } else if (Array.isArray(paths)) {
      paths.forEach(path => {
        if (_.isString(path)) {
          this._omit.push(path)
        }
      })
    }

    return this
  }

  /**
   * Adds specific location (in each property to validate) on where to pull the data
   * currently supported locations are 'params', 'query', 'body'
   *
   * @method setLocation
   * @param  {string}         loc               possible values are: params|query|body
   * @return {self}                             returned self for chaining
   */

  setLocation (loc) {
    this._location = loc
    return this
  }

  /**
   * Alternative for `setLocation()` to support multi location setting
   *
   * @method setLocations
   * @param  {object}         options           {location: [fieldPath, ...], ...}
   * @return {self}                             returned self for chaining
   */

  setLocations (options) {
    this._mixLocations = _.isPlainObject(options) ? options : {}
    return this
  }

  /**
   * Set multiple location and select the defined items only *(aka: pickByLoc())*
   *
   * @method cherryPick
   * @param  {object}         options           {location: [fieldPath, ...], ...}
   * @return {self}                             returned self for chaining
   */

  cherryPick (options) {
    if (!_.isEmpty(options) && _.isPlainObject(options)) {
      this.setLocations(options)
      this._cherryPick = true
    }

    return this
  }

  pickByLoc (options) { // alias
    return this.cherryPick(options)
  }

  /**
   * Add validation rule to existing validation item or create a new validation item
   *
   * @method addRule
   * @param  {string}       path                path to property to validate
   * @param  {string}       rule                validation name, it can be from chriso/validator.js or your custom validator name
   * @param  {array}        options             ordered params to pass to validator, successive array items can be used to print values in error message
   * @param  {object}       misc                miscellaneous. used internally for aliasing mongoose rules and params
   * @return {self}                             returned self for chaining
   */

  addRule (path, rule, options, misc) {
    if (_.isString(path)) {
      let value = {
        rule: rule,
        misc: misc,
        options: Array.isArray(options) || _.isPlainObject(options) ? options : []
      }

      if (_.isNil(this._addedRules[path])) {
        this._addedRules[path] = [value]
      } else {
        this._addedRules[path].push(value)
      }
    }

    return this
  }

  /**
   * Multiple addRule()
   *
   * @method addRules
   * @param  {array}          rules             array of addRule() params
   * @return {self}                             returned self for chaining
   */

  addRules (rules) {
    if (Array.isArray(rules)) {
      rules.forEach(rule => {
        if (Array.isArray(rule) && rule.length > 1) {
          this.addRule(...rule)
        }
      })
    }

    return this
  }

  /**
   * Setting array of objects as optional even if object property inside is required
   *
   * @method unstrict
   * @param  {(string|string[])}   arrPath      path to property
   * @return {self}                             returned self for chaining
   */

  unstrict (arrPath) {
    if (_.isString(arrPath)) {
      this._unstricts.push(arrPath)
    } else if (Array.isArray(arrPath)) {
      arrPath.forEach(path => {
        if (_.isString(path)) {
          this._unstricts.push(path)
        }
      })
    }

    return this
  }

  /**
   * Produce an empty schema (ignoring mongoose model)
   *
   * @method fresh
   * @return {self}                             returned self for chaining
   */

  fresh () {
    this._fresh = true
    return this
  }

  /**
   * Generate schema
   *
   * @method build
   * @return {self}                             returned self for chaining
   */

  build () {
    let schema = this._fresh ? {} : _.clone(this.validationSchema)
    let pickByLoc = {}

    if (this._fresh) this._addedRules = {}

    this._fresh = false
    // -- exclue()

    if (!_.isEmpty(this._omit)) {
      let paths = []
      this._omit = _.uniq(this._omit)

      Object.keys(schema).forEach(path => {
        paths.push(path)
      })

      this._omit.forEach(omitKey => {
        paths.forEach(path => {
          if ((new RegExp(`^${this.escapeRx(omitKey)}\\.`)).test(path)) {
            this._omit.push(path)
          }
        })
      })

      schema = _.omit(schema, this._omit)
      this._omit = []
    }

    // -- pickByLoc()

    let paths = []

    Object.keys(schema).forEach(path => {
      paths.push(path)
    })

    if (!_.isEmpty(this._mixLocations) && _.isPlainObject(this._mixLocations)) {
      Object.keys(this._mixLocations).forEach(loc => {
        if (LOCATIONS.includes(loc)) {
          if (_.isString(this._mixLocations[loc])) {
            this._mixLocations[loc] = [this._mixLocations[loc]]
          }

          if (Array.isArray(this._mixLocations[loc])) {
            this._mixLocations[loc].forEach(field => {
              if (!_.isEmpty(schema[field])) {
                pickByLoc[field] = Object.assign(_.clone(schema[field]), {in: loc})
              } else {
                paths.forEach(path => {
                  if ((new RegExp(`^${field.replace(/[*.]/g, '\\$&')}\\.`)).test(path)) {
                    pickByLoc[path] = Object.assign(_.clone(schema[path]), {in: loc})
                  }
                })
              }
            })
          }
        }
      })

      this._mixLocations = {}

      if (this._cherryPick && _.isEmpty(this._fields)) {
        this._cherryPick = false
        return pickByLoc
      }
    }

    // -- select()

    if (!_.isEmpty(this._fields) && Array.isArray(this._fields)) {
      let pureArr = []

      this._fields.forEach(path => {
        if (/^[\w].*\.\*$/.test(path)) {
          pureArr.push(path)
        }
      })

      pureArr.forEach(arrPath => {
        paths.forEach(path => {
          if ((new RegExp(`^${arrPath.replace(/[*.]/g, '\\$&')}\\.`)).test(path)) {
            this._fields.push(path)
          }
        })
      })

      this._fields = _.uniq(this._fields)
      schema = _.pick(schema, this._fields)
      this._fields = []
    }

    // -- location()

    if (LOCATIONS.includes(this._location)) {
      Object.keys(schema).forEach(path => {
        if (!_.isEmpty(schema[path])) {
          schema[path].in = this._location
        }
      })

      this._location = null
    }

    schema = Object.assign(schema, pickByLoc)

    // -- addRule() / addRules()

    if (!_.isEmpty(this._addedRules)) {
      Object.keys(this._addedRules).forEach(path => {
        this._addedRules[path].forEach(entry => {
          if (_.isNil(schema[path])) schema[path] = {}
          if (_.isNil(schema[path][entry.rule])) {
            Object.assign(schema[path], this.mapRule(path, entry.rule, {
              options: entry.options,
              misc: entry.misc
            }))
          }
        })
      })
    }

    // -- unstrict()

    if (!_.isEmpty(this._unstricts)) {
      let paths = []

      Object.keys(schema).forEach(path => {
        paths.push(path)
      })

      this._unstricts.forEach(arrPath => {
        for (let i = 0; i < paths.length; i++) {
          if ((new RegExp(`^${this.escapeRx(arrPath)}\\.`)).test(paths[i])) {
            let entry = {}
            entry[arrPath] = {optional: true}
            Object.assign(schema, entry)
            break
          }
        }
      })

      this._unstricts = []
    }

    return schema
  }
}

module.exports = WalterBuilder
