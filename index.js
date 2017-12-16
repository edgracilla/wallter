'use strict'

const _ = require('lodash')
const BPromise = require('bluebird')
const Halter = require('./lib/halter')

module.exports = (options) => {
  let halter = new Halter(options)

  return (req, res, next) => {
    req.halt = (schema) => {
      schema = _.isFunction(schema) ? schema(req) : schema
      if (_.isEmpty(schema)) {
        return BPromise.resolve([])
      }

      return halter.check(schema, {
        body: req.body,
        query: req.query,
        params: req.params,
      })
    }
  
    next()
  }
}