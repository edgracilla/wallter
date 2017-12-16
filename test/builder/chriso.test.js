/* global describe it before after */
'use strict'

const _ = require('lodash')

const Builder = require('../../index').builder

let schema
let builder

let options = {
  templates: {
    contains: `Value for field '%1$s' should contain '%2$s'.`,
    equals: `Value for field '%1$s' should equal to '%2$s'.`,
    // defaults for empty valdiation err message template is:
    // `Value for field 'fieldPath' doesn't meet the specified rule 'validation'`
  }
}

// chriso validator v9.0.2

let chrisoRules = [
  ['field_contains', 'contains', ['seed']],
  ['field_equals', 'equals', ['value']],
  ['field_isAfter', 'isAfter', [new Date()]],
  ['field_isAlpha', 'isAlpha', ['en-US']],
  ['field_isAlphanumeric', 'isAlphanumeric', ['en-US']],
  ['field_isAscii', 'isAscii'],
  ['field_isBase64', 'isBase64'],

  ['field_isBefore', 'isBefore', ['xx']],
  ['field_isBoolean', 'isBoolean'],
  ['field_isByteLength', 'isByteLength', [{min:0, max: 20}]],
  ['field_isCreditCard', 'isCreditCard'],
  ['field_isCurrency', 'isCurrency', [{symbol: '$'}]],
  ['field_isDataURI', 'isDataURI'],
  ['field_isDecimal', 'isDecimal', ['en-US']],
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
  ['field_isISBN', 'isISBN', [10]],
  ['field_isISSN', 'isISSN', [{case_sensitive: false}]],
  ['field_isISIN', 'isISIN'],
  ['field_isISO8601', 'isISO8601'],
  ['field_isISO31661Alpha2', 'isISO31661Alpha2'],
  ['field_isISRC', 'isISRC'],
  ['field_isIn', 'isIn', [['array','of','allowed','values']]],
  ['field_isInt', 'isInt', [{min: 0, max: 99}]],
  ['field_isJSON', 'isJSON'],
  ['field_isLatLong', 'isLatLong'],
  ['field_isLength', 'isLength', [{min: 0, max: 99}]],
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
  ['field_matches', 'matches', ['^(aa|bb|cc)$']]
]

describe('Basic model build test', function () {
  before('init', function (done) {
    builder = new Builder(options)
    done()
  })

  after('terminate', function () {
    setTimeout(() => {
      process.exit(1)
    }, 300)
  })

  describe('# validators', function () {
    it('xx', function (done) {
      schema = builder
        .addRules(chrisoRules)
        .build()

      console.log(schema)
      done()
    })
  })
})