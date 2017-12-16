'use strict'

const mongoose = require('mongoose')

module.exports = () => {
  return new Promise(resolve => {
    let Schema = mongoose.Schema

    let schema = new Schema({
      _id: {
        type: String,
        required: true
      },
      arr1d: [{
        type: String,
        required: true
      }],
      arr2d: [[{
        type: String,
        required: true
      }]],
      arr3d: [[[{
        type: String,
        required: true
      }]]],
      arr4d: [[[[{
        type: String,
        required: true
      }]]]],

      arr1dObj1: [{
        foo: {
          type: String,
          required: true
        }
      }],
      arr2dObj1: [[{
        foo: {
          type: String,
          required: true
        }
      }]],
      arr1dObj2: [{
        foo: {
          bar: {
            type: String,
            required: true
          }
        }
      }],
      arr2dObj2: [[{
        foo: {
          bar: {
            type: String,
            required: true
          }
        }
      }]],
      arr1dObj3: [{
        foo: {
          bar: {
            beer: {
              type: String,
              required: true
            }
          }
        }
      }],

      arrNest1: [[{
        foo: {
          bar: [[{
            type: String,
            required: true
          }]]
        }
      }]],
      arrNest2: [{
        foo: [{
          bar:  [{
            beer: [{
              type: String,
              required: true
            }]
          }],
        }]
      }],

      schemaObj: new Schema({
        foo: {
          type: String,
          required: true
        },
        bar: {
          type: String,
          required: true
        }
      }, {_id: false}),
      schemaObjArr: [new Schema({
        foo: {
          type: String,
          required: true
        },
        bar: {
          type: String,
          required: true
        }
      }, {_id: false})],
      schemaObjArrObjArr: [new Schema({
        foo: [{
          type: String,
          required: true
        }],
        bar: [{
          type: String,
          required: true
        }]
      }, {_id: false})],
      schemaObjArrSchemaObj: [new Schema({
        foo: new Schema({
          foo: {
            type: String,
            required: true,
          },
          bar: {
            type: String,
            required: true
          }
        }, {_id: false})
      }, {_id: false})],
    })

    mongoose.model(`ComplexModel`, schema, 'complex-model')
    resolve()
  })
}
