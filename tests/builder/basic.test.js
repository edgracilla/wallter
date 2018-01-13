/* global describe, it, after, before */
'use strict'

require('../models/basic.model')()

const _ = require('lodash')
const mongoose = require('mongoose')
const Builder = require('../../index').builder

let schema
let builder

let options = {
  uuid: true,
  model: mongoose.model('BasicModel'),
  templates: {unique: `Expecting unique value in '%1$s' field.`}
}

let nestedFields = [
  'arr.*',
  'obj.foo',
  'obj.bar',
  'arrArr.*.*',
  'arrObjArr.*.foo.*',
  'arrArrObj.*.*.foo',
  'arrObjArrObj.*.foo.*.bar',
  'arrObjArrObj.*.boo.*.beer'
]

describe('Basic model build test', function () {
  before('init', function (done) {
    builder = new Builder(options)

    try {
      schema = builder.build()
      // console.log(JSON.stringify(schema))
      done()
    } catch (err) {
      done(err)
    }
  })

  after('terminate', function () {
    setTimeout(() => {
      process.exit(1)
    }, 300)
  })

  describe('# validators', function () {
    it('_id - required', function (done) {
      if (/_id.*is required/.test(schema._id.required.msg)) {
        done()
      }
    })

    it('_id - isUUID', function (done) {
      if (/_id.*valid UUIDv/.test(schema._id.isUUID.msg)) {
        done()
      }
    })

    it('unique - required', function (done) {
      if (/unique.*is required/.test(schema.unique.required.msg)) {
        done()
      }
    })

    it('unique - unique', function (done) {
      if (/unique.*field/.test(schema.unique.unique.msg)) {
        done()
      }
    })

    it('email - required', function (done) {
      if (/email.*is required/.test(schema.email.required.msg)) {
        done()
      }
    })

    it('email - isEmail', function (done) {
      if (/email.*must be a valid email/.test(schema.email.isEmail.msg)) {
        done()
      }
    })

    it('minlen - minlength', function (done) {
      if (/minlen.*must be atleast/.test(schema.minlen.isLength.msg)) {
        done()
      }
    })

    it('minlen - optional', function (done) {
      if (schema.minlen.optional) {
        done()
      }
    })

    it('maxlen - maxlength', function (done) {
      if (/maxlen.*must not exceed/.test(schema.maxlen.isLength.msg)) {
        done()
      }
    })

    it('maxlen - optional', function (done) {
      if (schema.maxlen.optional) {
        done()
      }
    })

    it('enums - required', function (done) {
      if (/enums.*is required/.test(schema.enums.required.msg)) {
        done()
      }
    })

    it('enums - enums', function (done) {
      if (/enums.*Expecting/.test(schema.enums.matches.msg)) {
        done()
      }
    })
  })

  describe('# nested fields', function () {
    nestedFields.forEach(field => {
      it(`${field} - has required rule`, function (done) {
        if ((new RegExp(`${field.replace(/[.*]/g, '\\$&')}.*is required$`)).test(schema[field].required.msg)) {
          done()
        }
      })
    })
  })

  describe('# schema manipulator', function () {
    it('select() - string', function (done) {
      schema = builder
        .select('_id')
        .select('unique')
        .build()

        console.log(schema)

      if (_.keys(schema).length === 2) done()
    })

    it('select() - array', function (done) {
      schema = builder
        .select(['_id', 'enums'])
        .build()

      if (_.keys(schema).length === 2) done()
    })

    it('exclude() - string/array', function (done) {
      schema = builder
        .exclude('_id')
        .exclude('unique')
        .exclude(nestedFields) // can feed array
        .build()

      if (_.keys(schema).length === 6) done()
    })

    it('setLocation() - add location', function (done) {
      schema = builder
        .select('_id')
        .setLocation('body')
        .build()

      if (schema._id.in === 'body') done()
    })

    it('cherryPick() | pickByLoc() - set multiple location and select the defined item only', function (done) {
      schema = builder
        .select('islen')
        .setLocation('body')
        .cherryPick({query: '_id', params: ['minlen', 'maxlen']})
        .build()

      // console.log(schema)

      // -- output:
      // { _id:
      //   { isUUID: { msg: 'Value for field \'_id\' must be a valid UUIDv5' },
      //     required: { msg: 'Value for field \'_id\' is required' },
      //     in: 'query' },
      //   minlen:
      //   { optional: true,
      //     minlength: { msg: 'Value for field \'minlen\' must be atleast in 10 character(s).' },
      //     in: 'params' },
      //   maxlen:
      //   { optional: true,
      //     maxlength: { msg: 'Value for field \'maxlen\' must not exceed in 50 character(s).' },
      //     in: 'params' } },
      //   islen:
      //   { optional: true,
      //     isLength: { msg: 'Value for field \'islen\' must have a minimum length of 10 and maximum length of 50 characters' },
      //     in: 'body' },

      if (schema._id.in === 'query' && schema.minlen.in === 'params' && schema.islen.in === 'body') {
        done()
      }
    })

    it('setLocations() - set multiple location', function (done) {
      schema = builder
        .select('islen')
        .setLocation('body')
        .setLocations({query: '_id', params: ['minlen', 'maxlen']})
        .build()

      if (schema._id.in === 'query' && schema.minlen.in === 'params' && schema.islen.in === 'body') {
        done()
      }
    })

    it('addRule() - add to existing field rules', function (done) {
      schema = builder
        .select('email')
        .addRule('email', 'unique', ['ModelName', 'email'])
        .build()

      if (_.keys(schema.email).length === 3) done()
    })

    it('addRule() - add to existing or create new field rule', function (done) {
      schema = builder
        .select('email')
        .addRule('email', 'unique', ['ModelName', 'email'])
        .addRule('not.in.mongoose.schema', 'isUUID', [4]) // useful for foreign field validation
        .build()

        // console.log(schema)

        // -- output:
        // { email:
        //   { isEmail: { msg: 'Value for field \'email\' must be a valid email address' },
        //     required: { msg: 'Value for field \'email\' is required' },
        //     unique:
        //      { msg: 'Expecting unique value in \'email\' field.',
        //        options: [Object] } },
        //  'not.in.mongoose.schema':
        //   { isUUID:
        //      { msg: 'Value for field \'not.in.mongoose.schema\' must be a valid UUIDv4',
        //        options: [Object] } } }

      if (_.keys(schema.email).length === 3 && _.keys(schema).length === 2) done()
    })

    it('addRules() - multilple addRule()', function (done) {
      let extraRules = [
        ['email', 'unique', ['ModelName', 'email']],
        ['not.in.mongoose.schema', 'isUUID', [4]]
      ]

      schema = builder
        .select('email')
        .addRules(extraRules)
        .build()

      // same output as above

      if (_.keys(schema.email).length === 3 && _.keys(schema).length === 2) done()
    })

    it('fresh() - produce an empty schema', function (done) {
      schema = builder
        .fresh()
        .build()

      if (_.isEmpty(schema)) done()
    })

    it('unstrict() - setting array of objects as optional even if object prop inside is required', function (done) {
      schema = builder
        .select('arrObjArrObj.*')
        .unstrict(['arrObjArrObj.*'])
        .build()

      // console.log(schema)

      // -- output:
      // { 'arrObjArrObj.*.foo.*.bar': { required: { msg: 'Value for field \'arrObjArrObj.*.foo.*.bar\' is required' } },
      //   'arrObjArrObj.*.boo.*.beer': { required: { msg: 'Value for field \'arrObjArrObj.*.boo.*.beer\' is required' } },
      //   'arrObjArrObj.*': { optional: true } }

      if (_.keys(schema).length === 3) done()
    })

    it('dropRule() - remove validation rule from schema item', function (done) {
      schema = builder
        .select('email')
        .dropRule('email', ['isEmail'])
        .build()

      if (Object.keys(schema.email).length === 1) done()
    })

    it('dropRule() - multi build() call bug', function (done) {
      schema = {
        aa: builder
          .select('email')
          .build(),

        bb: builder
          .dropRule('email', ['isEmail'])
          .select('email')
          .build(),
      }

      if (Object.keys(schema.aa.email).length === 2 && Object.keys(schema.bb.email).length === 1) done()
    })
  })
})
