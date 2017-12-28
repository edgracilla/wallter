/* global describe it before after */
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
  templates: {
    unique: `Expecting unique value in '%1$s' field.`
  }
}

describe('Basic model build test', function () {
  before('init', function (done) {
    builder = new Builder(options)

    try {
      schema = builder.build()
      // console.log(JSON.stringify(schema))
      // console.log(schema)
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

  describe('hot test', function () {
    it('should be ok', function (done) {

      console.log(JSON.stringify(builder
        .addRule('q', 'isLength', [{max: 30}])
        // .addRule('q', 'required')
        .select('q')
        .build()
      ))

      done()
    })
  })
})