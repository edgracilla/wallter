'use strict'

const _ = require('lodash')
const restify = require('restify')
const BPromise = require('bluebird')
const mongoose = require('mongoose')

require('./model')()
const halter = require('../index').halter
const Builder = require('../index').builder

const server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
})

let builder = new Builder({
  uuid: true,
  model: mongoose.model('TestModel'),
  templates: {
    unique: `Expecting unique value in '%1$s' field. %2$s, %3$s`
  }
})

server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

server.use(halter({
  customValidators: {
    unique: (value, modelName, field) => {
      return new BPromise(resolve => {
        return setTimeout(() => {
          console.log('[executing promise custom validator (unique)]', value, modelName, field)
          resolve()
        }, 500)
      })
    }
  }
}))

console.log(builder.select('email').build())

server.post('/hot-test', (req, res, next) => {
  let schema = builder
    // .select(['_id', 'obj.foo' ])

    // .select('arr1d.*')
    // .select('arr2d.*.*')
    // .select('arr3d.*.*.*')
    // .select('arr4d.*.*.*.*')

    // .select('arr1dObj1.*.foo')
    // .select('arr1dObj2.*.foo.bar')
    // .select('arr1dObj3.*.foo.bar.nar')

    // .select('arr2dObj1.*.*.foo')
    // .select('arr2dObj2.*.*.foo.bar')

    // .select('arrNest1.*.*.foo.bar.*.*')
    // .select('arrNest2.*.foo.*.bar.*.nar.*')

    // .location('params')

    // TODO: select 'arrObj.*' instead of 'arrObj.*.foo'
    .select(['arrObj.*'])
    // .unstrict('arrObj.*')
    .build()

    // console.log(schema)
    // console.log('\n', JSON.stringify(schema), '\n')

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

server.post('/noloc/:field', (req, res, next) => {
  let schema = builder
    .select(req.params.field)
    .build()

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

server.post('/nolocall', (req, res, next) => {
  let schema = builder
    .build()

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

server.post('/body', (req, res, next) => {
  let schema = builder
    .location('body')
    .build()

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

server.post('/query', (req, res, next) => {
  let schema = builder
    .location('query')
    .build()

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

server.post('/params', (req, res, next) => {
  let schema = builder
    .location('params')
    .build()

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

server.listen(8080, () => {
  // console.log('%s listening at %s', server.name, server.url);
})
