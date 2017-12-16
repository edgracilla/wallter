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
      unique: {
        type: String,
        required: true,
        unique: true
      },
      email: {
        type: String,
        required: true
      },
      minlen: {
        type: String,
        minlength: 10
      },
      maxlen: {
        type: String,
        maxlength: 50
      },
      islen: {
        type: String,
        minlength: 10,
        maxlength: 50
      },
      enums: {
        type: String,
        enum: ['jane', 'jean', 'jhon'],
        required: true
      },
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
      arrArr: [[{
        type: String,
        required: true
      }]],
      arrObjArr: [{
        foo: [{
          type: String,
          required: true
        }]
      }],
      arrArrObj: [[{
        foo: {
          type: String,
          required: true
        }
      }]],
      arrObjArrObj: [{
        foo: [{
          bar: {
            type: String,
            required: true
          }
        }],
        boo: [{
          beer: {
            type: String,
            required: true
          }
        }]
      }],
    })

    mongoose.model(`BasicModel`, schema, 'basic-model')
    resolve()
  })
}
