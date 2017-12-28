/* global describe, it, after, before */
'use strict'

require('../models/complex.model')()

const mongoose = require('mongoose')
const Builder = require('../../index').builder

let schema
let builder

let options = {
  uuid: true,
  model: mongoose.model('ComplexModel'),
  templates: {unique: `Expecting unique value in '%1$s' field.`}
}

let nestedFields = [
  'arr1d.*',
  'arr2d.*.*',
  'arr3d.*.*.*',
  'arr4d.*.*.*.*',
  'arr1dObj1.*.foo',
  'arr2dObj1.*.*.foo',
  'arr1dObj2.*.foo.bar',
  'arr2dObj2.*.*.foo.bar',
  'arr1dObj3.*.foo.bar.beer',
  'arrNest1.*.*.foo.bar.*.*',
  'arrNest2.*.foo.*.bar.*.beer.*',
  'schemaObj.foo',
  'schemaObj.bar',
  'schemaObjArr.*.foo',
  'schemaObjArr.*.bar',
  'schemaObjArrObjArr.*.foo.*',
  'schemaObjArrObjArr.*.bar.*',
  'schemaObjArrSchemaObj.*.foo.foo',
  'schemaObjArrSchemaObj.*.foo.bar'
]

describe('Complex model build test', function () {
  before('init', function (done) {
    builder = new Builder(options)

    try {
      schema = builder.build()
      // console.log(schema)

      // -- output:
      // { _id:
      //   { isUUID: { msg: 'Value for field \'_id\' must be a valid UUIDv5' },
      //     required: { msg: 'Value for field \'_id\' is required' } },
      //  'arr1d.*': { required: { msg: 'Value for field \'arr1d.*\' is required' } },
      //  'arr2d.*.*': { required: { msg: 'Value for field \'arr2d.*.*\' is required' } },
      //  'arr3d.*.*.*': { required: { msg: 'Value for field \'arr3d.*.*.*\' is required' } },
      //  'arr4d.*.*.*.*': { required: { msg: 'Value for field \'arr4d.*.*.*.*\' is required' } },
      //  'arr1dObj1.*.foo': { required: { msg: 'Value for field \'arr1dObj1.*.foo\' is required' } },
      //  'arr2dObj1.*.*.foo': { required: { msg: 'Value for field \'arr2dObj1.*.*.foo\' is required' } },
      //  'arr1dObj2.*.foo.bar': { required: { msg: 'Value for field \'arr1dObj2.*.foo.bar\' is required' } },
      //  'arr2dObj2.*.*.foo.bar': { required: { msg: 'Value for field \'arr2dObj2.*.*.foo.bar\' is required' } },
      //  'arr1dObj3.*.foo.bar.beer': { required: { msg: 'Value for field \'arr1dObj3.*.foo.bar.beer\' is required' } },
      //  'arrNest1.*.*.foo.bar.*.*': { required: { msg: 'Value for field \'arrNest1.*.*.foo.bar.*.*\' is required' } },
      //  'arrNest2.*.foo.*.bar.*.beer.*': { required: { msg: 'Value for field \'arrNest2.*.foo.*.bar.*.beer.*\' is required' } },
      //  'schemaObj.foo': { required: { msg: 'Value for field \'schemaObj.foo\' is required' } },
      //  'schemaObj.bar': { required: { msg: 'Value for field \'schemaObj.bar\' is required' } },
      //  'schemaObjArr.*.foo': { required: { msg: 'Value for field \'schemaObjArr.*.foo\' is required' } },
      //  'schemaObjArr.*.bar': { required: { msg: 'Value for field \'schemaObjArr.*.bar\' is required' } },
      //  'schemaObjArrObjArr.*.foo.*': { required: { msg: 'Value for field \'schemaObjArrObjArr.*.foo.*\' is required' } },
      //  'schemaObjArrObjArr.*.bar.*': { required: { msg: 'Value for field \'schemaObjArrObjArr.*.bar.*\' is required' } },
      //  'schemaObjArrSchemaObj.*.foo.foo': { required: { msg: 'Value for field \'schemaObjArrSchemaObj.*.foo.foo\' is required' } },
      //  'schemaObjArrSchemaObj.*.foo.bar': { required: { msg: 'Value for field \'schemaObjArrSchemaObj.*.foo.bar\' is required' } } }

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

  describe('# validate output', function () {
    nestedFields.forEach(field => {
      it(`${field} - has required rule`, function (done) {
        if ((new RegExp(`${field.replace(/[.*]/g, '\\$&')}.*is required$`)).test(schema[field].required.msg)) {
          done()
        }
      })
    })
  })
})
