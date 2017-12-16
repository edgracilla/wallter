'use strict'

const _ = require('lodash')
const axios = require('axios')
const restify = require('restify')
const BPromise = require('bluebird')

const halter = require('../../index').halter
const Builder = require('../../index').builder

let server
let conf = {}
let host = 'http://localhost:8080'

let chrisoRules = [
  ['field_contains', 'contains', ['seed']],
  ['field_equals', 'equals', ['value']],
  ['field_isAfter', 'isAfter', ['12/12/12']],
  ['field_isAlpha', 'isAlpha', ['en-US']],
  ['field_isAlphanumeric', 'isAlphanumeric', ['en-US']],
  ['field_isAscii', 'isAscii'],
  ['field_isBase64', 'isBase64'],
]

let builder = new Builder({
  templates: {
    unique: `Expecting unique value in '%1$s' field. %2$s, %3$s`,
  }
})

describe('Server Test', function () {
  let host = 'http://localhost:8080'
  let conf = {}

  before('init', function (done) {
    let schema = builder
      .addRules(chrisoRules)
      .build()

    console.log(schema)

    server = restify.createServer({ name: 'myapp', version: '1.0.0'});
    server.use(restify.plugins.acceptParser(server.acceptable))
    server.use(restify.plugins.queryParser())
    server.use(restify.plugins.bodyParser())
    server.use(halter())

    server.post('/hot-test', function (req, res, next) {
      if (!_.isEmpty(schema)) {
        req.halt(schema).then(result => {
          res.send(result)
          return next()
        })
      } else {
        res.send([])
        return next()
      }
    })
    
    server.listen(8080, function () {
      done()
    })
  })

  after('terminate', function () {
    setTimeout(() => {
      server.cose()
      process.exit(1)
    }, 300)
  })

  describe('# hot testing', function () {
    it('should ok', function (done) {
      let data = {
        field_contains: 'seeds',
        field_equals: 'value',
        field_isAfter: '12/12/13',
        field_isAlpha: 'abc',
        field_isAlphanumeric: 'abs123',
        field_isAscii: 'abc',
        field_isBase64: 'ZmllbGRfaXNCYXNlNjQ=',
      }

      axios.post(`${host}/hot-test`, data, conf).then(ret => {
        // if (ret.status === 200 && Array.isArray(ret.data)) {
          console.log()
          console.log(ret.data)
        //   // done()
        // }
        done()
      }).catch(console.log)
    })
  })
})