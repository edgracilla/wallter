'use strict'

require('./test-model')()
const Builder = require('../index')
const mongoose = require('mongoose')

let options = {
  uuid: true,
  arrStrict: false,
  model: mongoose.model('TestModel'),
  templates: {
    unique: `Expecting unique value in '%1$s' field. %2$s, %3$s`,
    unique: `Expecting unique value in '%(path)s' field. %(model)s, %(field)s`,
  }
}

let extraRules = [
  // ['schemaObjArr.*.foo', 'isUUID', [4]],
  // ['schemaObjArr.*.foo', 'isEmail'],
  // ['schemaObjArr.*.for', 'unique', ['aa', 'bb']]
  ['schemaObjArr.*.bar', 'unique', {
    model: 'modelFoo',
    field: 'fieldBar'
  }]
]
  
let builder = new Builder(options)
let schema = builder
  // .pickByLoc({query: ['_id'], params: ['email']})
  // .select(['_id', 'enums', 'ref'])
  // .location('body')
  .addRules(extraRules)
  // .exclude(['schemaObjArrSchemaObj.*.foo'])
  // .addRule('email', 'unique', ['aa', 'bb'])
  // .addRule('arrObj.*.bar', 'unique', ['aa', 'bb'])
  // .unstrict(['arrObj.*', 'schemaObjArr.*'])

  // .pickByLoc({query: ['schemaObjArrSchemaObj']})

  // .select(['_id', 'arrObj.*'])

  // .fresh()
  // .addRules(extraRules)

  // .select('email')
  .build()

console.log('\n--schema', schema)
console.log('\nOUTPUT:', JSON.stringify(schema))