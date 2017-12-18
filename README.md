# wallter
Highly influenced by [ctavan/express-validator](https://github.com/ctavan/express-validator) and relying from [chriso/validator.js](https://github.com/chriso/validator.js), wallter does almost the same goal as validator. The edge is, it supports auto validation for arrays, nested arrays, and/or nested arrays of objects without using `customValidator` workaround. It uses the schema based method and has the ability to build a validation schema straigth from your mongoose model.

# Installation

`npm install --save wallter`

# Usage
[Sample Mongoose Model](https://github.com/edgracilla/wallter/blob/master/test/models/basic.model.js)

```js
require('./model')()
const restify = require('restify')
const mongoose = require('mongoose')

const halter = require('wallter').halter
const Builder = require('wallter').builder

const server = restify.createServer({ name: 'myapp', version: '1.0.0'});

const builder = new Builder({
  uuid: true,
  model: mongoose.model('TestModel'),
  templates: {
    unique: `Expecting unique value in '%1$s' field. (Model: %2$s, Field: %3$s)`
  }
})

server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

server.use(halter({
  customValidators: {
    // sample custom validator, supporting mongoose 'unique')
    unique: (value, modelName, field) => {
      return new Promise((resolve, reject) => {
        return setTimeout(() => {
          resolve()
        }, 500)
      })
    }
  }
}))

server.post('/test', function (req, res, next) {
  let schema = builder
    .location('body')
    .exclude(['arr.*.foo'])
    .addRule('email', 'unique', ['modelName', 'email']) // custom validator above
    .build()

  req.halt(schema).then(result => {
    if (result.length) {
      res.send(400, result)
    } else {
      res.send(200)
    }
    
    return next()
  })
})

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
})
```

## Builder - Validation Schema Manipulator
See [basic tests](https://github.com/edgracilla/wallter/blob/master/test/builder/basic.test.js) for an in depth usage and samples.

Methods                                        | Description
----------------------------------------------- | --------------------------------------
**select(*paths*)**                             | Get specific field from pre generated schema (if mongoose model were attached)<br><br>***params:*** *paths {(string\|string[])} - path to property to validate`*
**exclude(*paths*)**                            | Remove specific field from pre generated schema (if mongoose model were attached)<br><br>***params:*** *paths {(string\|string[])} - path to property to validate*
**location(*loc*)**                             | Adds specific location (in each property to validate) on where to pull the data. *currently supported locations are 'params', 'query', 'body'*<br><br>***params:*** *loc {string} - possible values are: params\|query\|body*
**pickByLoc(*options*)**                        | Alternative for `location()` to support multi location selection. <br><br>***params:*** *options {object} - {location: [fieldPath, ...], ...}*<br>e.g. `{query: ['_id'], body: ['foo.bar', 'arr.*.foo.bar']}` 
**addRule(*path, rule, options, misc*)**        | Add validation rule to existing validation item or create a new validation item<br><br>***params:*** <br>*- path {string} - path to property to validate*<br>*- rule {string} - validation name, it can be from validator.js or your custom validator*<br>*- options {array} - ordered params to pass to validator, successive array items can be used to print values in error message*<br>*- misc {object} - miscellaneous. used internally for aliasing mongoose rules and params*
**addRules(*[[path, rule, options, misc]]*)**   | Multilple addRule()<br><br>***params:*** *rules {array}  - array of addRule() params*
**unstrict(*arrPath*)**                         | Setting array of objects as optional even if object property inside is required<br><br>***params:*** *arrPath {(string\|string[])} - path to property*
**fresh()**                                     | Produce an empty schema (ignoring mongoose model)
**build()**                                     | Generate schema.

# Error Messages
*(more infos to come in this section)*
## Printing
It uses [alexei/sprintf.js](https://github.com/alexei/sprintf.js) *(`vsprintf` specifically)* as an underlying mechanism to pass values to error messages/templates.

## Template

## Custom Validator - params & err messages
