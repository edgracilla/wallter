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
      email: {
        type: String,
        required: true,
        unique: true
      },
      minlength: {
        type: String,
        minlength: 5,
        required: true
      },
      maxlength: {
        type: String,
        maxlength: 5,
        required: true
      },
      minmaxlength: {
        type: String,
        maxlength: 2,
        maxlength: 5,
        required: true
      },
      enums: {
        type: String,
        enum: ['jane', 'jean', 'jhon'],
        required: true
      },

      ref: {
        type: String,
        ref: `Demo1`,
        required: true
      },
      arrRef: [{
        type: String,
        ref: `Demo2`,
        required: true
      }],

      arr: [{
        type: String,
        required: true
      }],
      obj: {
        foo: {
          type: String,
          required: true
        },
        bar: {
          type: String,
          required: true
        },
      },
      arrObj: [{
        foo: {
          type: String,
          required: true
        },
        bar: {
          type: String,
          required: true
        }
      }],
      arrArr: [[{
        type: String,
        required: true
      }]],
      arrArrObj: [[{
        foo: {
          type: String,
          required: true
        }
      }]],
      arrObjArr: [{
        foo: [{
          type: String,
          required: true
        }]
      }],
      arrObjArrObj: [{
        foo: [{
          bar: {
            type: String,
            required: true
          }
        }],
        moo: [{
          nar: {
            type: String,
            required: true
          }
        }]
      }],
      arrObjArrObjObj: [{
        foo: [{
          bar: {
            beer: {
              type: String,
            required: true
            }
          }
        }],
        fooo: [{
          barr: {
            beerr: {
              type: String,
              required: true
            }
          }
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
            required: true,
            // minlength: 5,
          }
        }
      }]],
      arr1dObj3: [{
        foo: {
          bar: {
            nar: {
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
            nar: [{
              type: String,
              required: true
            }]
          }],
        }]
      }],
    })

    mongoose.model(`TestModel`, schema, 'testmodel')
    resolve()
  })
}
