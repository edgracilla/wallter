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
  ['field_isBefore', 'isBefore', ['12/12/12']],
  ['field_isBoolean', 'isBoolean'],
  ['field_isByteLength', 'isByteLength', [{min:0, max: 10}]],
  ['field_isCreditCard', 'isCreditCard'],
  ['field_isCurrency', 'isCurrency', [{symbol: '$'}]],
  ['field_isDataURI', 'isDataURI'],
  ['field_isDecimal', 'isDecimal', [{locale: 'en-US'}]],
  ['field_isDivisibleBy', 'isDivisibleBy', [3]],
  ['field_isEmail', 'isEmail', [{ allow_display_name: false}]],
  ['field_isEmpty', 'isEmpty'],
  ['field_isFQDN', 'isFQDN', [{allow_underscores: false}]],
  ['field_isFloat', 'isFloat', ['en-US']],
  ['field_isFullWidth', 'isFullWidth'],
  ['field_isHalfWidth', 'isHalfWidth'],
  ['field_isHash', 'isHash', ['md5']],
  ['field_isHexColor', 'isHexColor'],
  ['field_isHexadecimal', 'isHexadecimal'],
  ['field_isIP', 'isIP', [4]],
  ['field_isISBN', 'isISBN', [13]],
  ['field_isISSN', 'isISSN', [{case_sensitive: false}]],
  ['field_isISIN', 'isISIN'],
  ['field_isISO8601', 'isISO8601'],
  ['field_isISO31661Alpha2', 'isISO31661Alpha2'],
  ['field_isISRC', 'isISRC'],
  ['field_isIn', 'isIn', [['array','of','allowed','values']]],
  ['field_isInt', 'isInt', [{min: 0, max: 99}]],
  ['field_isJSON', 'isJSON'],
  ['field_isLatLong', 'isLatLong'],
  ['field_isLength', 'isLength', [{min: 1, max: 99}, 1, 99]], // 2nd & 3rd item are for printing (see templates/messges.json)
  ['field_isLowercase', 'isLowercase'],
  ['field_isMACAddress', 'isMACAddress'],
  ['field_isMD5', 'isMD5'],
  ['field_isMimeType', 'isMimeType'],
  ['field_isMobilePhone', 'isMobilePhone', ['en-US']],
  ['field_isMongoId', 'isMongoId'],
  ['field_isMultibyte', 'isMultibyte'],
  ['field_isNumeric', 'isNumeric'],
  ['field_isPort', 'isPort'],
  ['field_isPostalCode', 'isPostalCode', ['US']],
  ['field_isSurrogatePair', 'isSurrogatePair'],
  ['field_isURL', 'isURL', [{require_host: true}]],
  ['field_isUUID', 'isUUID', [5]],
  ['field_isUppercase', 'isUppercase'],
  ['field_isVariableWidth', 'isVariableWidth'],
  ['field_isWhitelisted', 'isWhitelisted', ['abc']],
  ['field_matches', 'matches', ['^(aa|bb|cc)$', /* modifiers here */, 'aa, bb, cc']]
]

let builder = new Builder({
  templates: {
    // overwrite or add message templates (see templates/messges.json)
    contains: `Value for field '%1$s' should contain '%2$s'.`,
    equals: `Value for field '%1$s' should equal to '%2$s'.`,
  }
})

describe('Server Test', function () {
  before('init', function (done) {
    let schema = builder
      .addRules(chrisoRules)
      .build()

    server = restify.createServer({ name: 'myapp', version: '1.0.0'});
    server.use(restify.plugins.acceptParser(server.acceptable))
    server.use(restify.plugins.queryParser())
    server.use(restify.plugins.bodyParser())
    server.use(halter())

    server.post('/test', function (req, res, next) {
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

  describe('# chriso/validator', function () {
    it('should ok', function (done) {
      let data = {
        field_contains: 'seeds',
        field_equals: 'value',
        field_isAfter: '12/12/13',
        field_isAlpha: 'abc',
        field_isAlphanumeric: 'abs123',
        field_isAscii: 'abc',
        field_isBase64: 'ZmllbGRfaXNCYXNlNjQ=',
        field_isBefore: '12/12/11',
        field_isBoolean: 'true',
        field_isByteLength: 'lengthy',
        field_isCreditCard: '378734493671000',
        field_isCurrency: '$123',
        field_isDataURI: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D',
        field_isDecimal: '123.4',
        field_isDivisibleBy: '6',
        field_isEmail: 'aa@bb.cc',
        field_isEmpty: '',
        field_isFQDN: 'domain.com',
        field_isFloat: '12.34',
        field_isFullWidth: 'ｔｅｓｔ',
        field_isHalfWidth: 'test',
        field_isHash: '098f6bcd4621d373cade4e832627b4f6',
        field_isHexColor: 'ff0000',
        field_isHexadecimal: '23BC2',
        field_isIP: '1.2.3.4',
        field_isISBN: '978-1-56619-909-4',
        field_isISSN: '2049-3630',
        field_isISIN: 'US0378331005',
        field_isISO8601: '1997-07-16T19:20:30+01:00',
        field_isISO31661Alpha2: 'AU',
        field_isISRC: 'JMK401400212',
        field_isIn: 'allowed',
        field_isInt: '23',
        field_isJSON: '{"a":"b"}',
        field_isLatLong: '45.611729,8.900090',
        field_isLength: 'abc123',
        field_isLowercase: 'imlowercase',
        field_isMACAddress: '00:1B:44:11:3A:B7',
        field_isMD5: '098f6bcd4621d373cade4e832627b4f6',
        field_isMimeType: 'application/json',
        field_isMobilePhone: '+14155552671',
        field_isMongoId: '507f191e810c19729de860ea',
        field_isMultibyte: '¥',
        field_isNumeric: '123',
        field_isPort: '8080',
        field_isPostalCode: '72716',
        field_isSurrogatePair: '🀜',
        field_isURL: 'https://www.google.com',
        field_isUUID: '6b69b6dc-a087-5cc1-832a-7bf317970027',
        field_isUppercase: 'UP',
        field_isVariableWidth: 'ｔｅｓｔer',
        field_isWhitelisted: 'abc',
        field_matches: 'aa',
      }

      axios.post(`${host}/test`, data, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data) && _.isEmpty(ret.data)) {
          done()
        }
      }).catch(console.log)
    })
  })
})