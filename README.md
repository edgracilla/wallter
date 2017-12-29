# wallter
Highly influenced by [ctavan/express-validator](https://github.com/ctavan/express-validator) and relying from [chriso/validator.js](https://github.com/chriso/validator.js), wallter does almost the same goal as validator. The edge is, it supports auto validation for arrays, nested arrays, and/or nested arrays of objects without using `customValidator` workaround. It uses the schema based method and has the ability to build a validation schema straight from your mongoose model.

# Installation

`npm install --save wallter`

# Usage
[Sample Mongoose Model](https://github.com/edgracilla/wallter/blob/master/tests/models/basic.model.js)

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
# Validator
All validator specified in [validator.js](https://github.com/chriso/validator.js) v9.2.0 are attached and its validator name will be used as the `rule` name in validation schema.

# Builder
### Options

Option        | Description
------------- | -------------------
uuid          | Force to add validation `isUUID()` to fields `_id` and `ref`. *Default: false* 
uuidVersion   | Version to use once `uuid` is enabled. *Default: 5*
model         | Mongoose object model to parse to generate validation schema.
templates     | Error message templates for your custom validator *(see section below for [Error Messages](https://github.com/edgracilla/wallter/blob/master/README.md#error-messages))*.

### Validation Schema Generator/Builder *(Mongoose specific)*
The messy problems arrives if you have multiple REST `resource` and you need to write validation schema in each resource, or clever way is to reuse some of them if possible. But still it is messy. So why not use a validation schema generator from a defined mongoose model?

```js
const Builder = require('wallter').builder

const builder = new Builder({
  uuid: true,
  model: mongoose.model('TestModel'),
  templates: {
    unique: `Expecting unique value in '%1$s' field. (Model: %2$s, Field: %3$s)`
  }
})

let schema = builder.build()
console.log(schema)
```

[Sample Mongoose Schema](https://github.com/edgracilla/wallter/blob/master/tests/models/basic.model.js)<br>
[Sample Validation Schema - Output](https://github.com/edgracilla/wallter/blob/master/tests/others/output.json)

### Validation Schema Manipulator
See [basic tests](https://github.com/edgracilla/wallter/blob/master/tests/builder/basic.test.js) for an in depth usage and samples.

Methods                                        | Description
----------------------------------------------- | --------------------------------------
**select(*paths*)**                             | Get specific field from pre generated schema (if mongoose model were attached)<br><br>***params:*** *paths {(string\|string[])} - path to property to validate`*
**exclude(*paths*)**                            | Remove specific field from pre generated schema (if mongoose model were attached)<br><br>***params:*** *paths {(string\|string[])} - path to property to validate*
**setLocation(*loc*)**                          | Adds specific location (in each property to validate, or to the selected ones) on where to pull the data. *currently supported locations are 'params', 'query', 'body'*<br><br>***params:*** *loc {string} - possible values are: params\|query\|body*
**setLocations(*options*)**                     | Multiple location setting. <br><br>***params:*** *options {object} - {location: [fieldPath, ...], ...}*<br>e.g. `{query: ['_id'], body: ['foo.bar', 'arr.*.foo.bar']}`
**cherryPick(*options*)**                       | Set multiple location and select the defined items only *(aka: pickByLoc())*. <br><br>***params:*** *options {object} - {location: [fieldPath, ...], ...}*<br>e.g. `{query: ['_id'], body: ['foo.bar', 'arr.*.foo.bar']}`
**addRule(*path, rule, options*)**              | Add validation rule to existing validation item or create a new validation item<br><br>***params:*** <br>*- path {string} - path to property to validate*<br>*- rule {string} - validation name, it can be from validator.js or your custom validator*<br>*- options {array} - ordered params to pass to validator, successive array items can be used to print values in error message*
**addRules(*[[path, rule, options]]*)**   | Multilple addRule()<br><br>***params:*** *rules {array}  - array of addRule() params*
**unstrict(*arrPath*)**                         | Setting array of objects as optional even if object property inside is required<br><br>***params:*** *arrPath {(string\|string[])} - path to property*
**fresh()**                                     | Produce an empty schema (ignoring mongoose model)
**build()**                                     | Generate schema.

# Error Messages
By default, error messages to *some* validators are templated (see it [here](https://github.com/edgracilla/wallter/blob/master/template/messages.json)), but you can specify your own message by passing your error message template to our builder options.

It uses [sprintf.js](https://github.com/alexei/sprintf.js) *(`vsprintf` specifically)* as an underlying mechanism to pass values to error messages/templates.

```js
let options = {
  uuid: true,
  model: mongoose.model('BasicModel'),
  templates: {
    unique: `Expecting unique value in '%1$s' field.`,
    yourValidator: `Your message here, you can pass param values using sprintf.js syntax`
  }
}
```

### Printing param values
In `addRule()` the 3rd array param `options` handles all values that you want to attach to your error message, but there is a numbering scheme. By default, I attached the `path` as the first item of the `options` array, the 2nd and succeeding will be the options to be passed to validator options if needed.  *Check [sprintf.js](https://github.com/alexei/sprintf.js#usage) or these [tests](https://github.com/edgracilla/wallter/tree/master/tests) for an in depth usage*.

# License

MIT License