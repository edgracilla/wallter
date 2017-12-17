# wallter
Highly influenced by [ctavan/express-validator](https://github.com/ctavan/express-validator) and relying from [chriso/validator.js](https://github.com/chriso/validator.js), wallter does almost the same goal as validator. The edge is, it supports auto validation for arrays, nested arrays, and/or nested arrays of objects without using `customValidator` workaround. Ir uses the schema based method and has the ability to build a validation schema straigth from your mongoose model.

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
- select(*String|Array*) - get specific field validation schema
- exclude(*String|Array*)) - remove specific field validation schema
- location() - add location on where to check *(currently supported 'location params', 'query', 'body')*
- pickByLoc() - pick/select by location
- addRule() - add to existing field rules
- addRule() - add to existing or create new field rule
- addRules() - multilple addRule()
- fresh() - produce an empty schema (ignoring mongoose model)
- unstrict() - setting array of objects as optional even if object prop inside is required

# Error Messages
*(more infos to come in this section)*
## Printing
It uses [alexei/sprintf.js](https://github.com/alexei/sprintf.js) *(`vsprintf` specifically)* as an underlying mechanism to pass values to error messages/templates.

## Template

## Custom Validator - params & err messages