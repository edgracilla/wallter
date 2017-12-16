'use strict'

const _ = require('lodash')
const sprintf = require('sprintf-js').sprintf
const vsprintf = require('sprintf-js').vsprintf
const defaultTemplate = require('../template/messages')

const ALLOCATIONS = ['params', 'query', 'body', 'headers', 'cookies']

class WalterBuilder {
  constructor (options) {
    this._mix = null
    this._alloc = null
    this._fresh = false

    this._omit = []
    this._fields = []
    this._unstricts = []
    this._addedRules = {}

    this.options = options || {}

    _.defaults(this.options, {
      model: {},
      uuid: false,
      templates: {},
      uuidVersion: 5,
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
          options: [
            {min: field.minlength, max: field.maxlength},
            field.minlength,
            field.maxlength
          ]
        }))
      } else {
        if (!_.isNil(field.minlength) && field.minlength > 0) {
          Object.assign(entry, this.mapRule(absPath, 'isLength', {
            options: [{min: field.minlength}, field.minlength],
            tag: 'minlength'
          }))
        }
        if (!_.isNil(field.maxlength) && field.maxlength > 0) {
          Object.assign(entry, this.mapRule(absPath, 'isLength', {
            options: [{max: field.maxlength}, field.maxlength],
            tag: 'maxlength'
          }))
        }
      }

      if (!_.isNil(field.enum) && Array.isArray(field.enum) && field.enum.length) {
        Object.assign(entry, this.mapRule(absPath, 'matches', {
          options: [`^(${field.enum.join('|')})$`, field.enum.join(', ')]
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
    let entry = {}
    let key = misc.tag || validationName
    
    entry[key] = {}
    
    if (_.isNil(this.options.templates[key])) {
      this.options.templates[key]= `Value for field '%1$s' doesn't meet the specified rule '${key}'`
    }

    if (_.isPlainObject(misc.options)) {
      misc.options.path = absPath
      entry[key].msg = sprintf(this.options.templates[key], misc.options)
      // TODO: options for object??
    } else if (Array.isArray(misc.options) || _.isNil(misc.options)) {
      entry[key].msg = vsprintf(this.options.templates[key], [absPath].concat(misc.options).filter(Boolean))
      if (!_.isEmpty(misc.options)) entry[key].options = misc.options
    }

    return entry
  }

  mapRuleX (absPath, validationName, misc = {}) {
    let entry = {}

    switch (misc.tag || validationName) {
      case 'required':
        entry.required = {
          msg: vsprintf(this.options.templates.required, [absPath])
        }; break

      case 'unique':
        entry.unique = {
          options: misc.options || [],
          msg: vsprintf(this.options.templates.unique, [absPath].concat(misc.options))
        }; break
      
      case 'isEmail':
        entry.isEmail = {
          msg: vsprintf(this.options.templates.isEmail, [absPath])
        }; break
      
      case 'isUUID':
        if (Array.isArray(misc.options)) {
          misc.options[0] = misc.options[0] || this.options.uuidVersion
        }
        
        entry.isUUID = {
          options: misc.options || [],
          msg: vsprintf(this.options.templates.isUUID, [absPath, misc.options[0] || this.options.uuidVersion])
        }; break
      
      case 'minlength':
        entry.isLength = {
          options: misc.options || [],
          msg: vsprintf(this.options.templates[misc.tag], [absPath, misc.minlength])
        }; break

      case 'maxlength':
        entry.isLength = {
          options: misc.options || [],
          msg: vsprintf(this.options.templates[misc.tag], [absPath, misc.maxlength])
        }; break
      
      case 'isLength':
        entry.isLength = {
          options: misc.options || [],
          msg: vsprintf(this.options.templates.isLength, [absPath, misc.minlength, misc.maxlength])
        }; break

      case 'matches':
        entry.matches = {
          options: misc.options || [],
          msg: vsprintf(this.options.templates.matches, [absPath, misc.enums])
        }
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

  location (alloc) {
    this._alloc = alloc
    return this
  }

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

  pickByLoc (options) {
    this._mix = _.isPlainObject(options) ? options : {}
    return this
  }

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

  fresh () {
    this._fresh = true
    return this
  }

  build () {
    let schema = this._fresh ? {} : _.clone(this.validationSchema)
    let pickByLoc = {}

    if (this._fresh) this. _addedRules = {} // bug fix on fresh after addRule

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

    if (!_.isEmpty(this._mix) && _.isPlainObject(this._mix)) {
      Object.keys(this._mix).forEach(alloc => {
        if (ALLOCATIONS.includes(alloc) && Array.isArray(this._mix[alloc])) {
          this._mix[alloc].forEach(field => {
            if (!_.isEmpty(schema[field])) {
              pickByLoc[field] = Object.assign(_.clone(schema[field]), {in: alloc})
            } else {
              paths.forEach(path => {
                if ((new RegExp(`^${field.replace(/[*.]/g, '\\$&')}\\.`)).test(path)) {
                  pickByLoc[path] = Object.assign(_.clone(schema[path]), {in: alloc})
                }
              })
            }
          })
        }
      })

      this._mix = null

      if (_.isEmpty(this._fields) && _.isNil(this._alloc)) {
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

    if (ALLOCATIONS.includes(this._alloc)) {
      Object.keys(schema).forEach(path => {
        if (!_.isEmpty(schema[path])) {
          schema[path].in = this._alloc
        }
      })

      this._alloc = null
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
