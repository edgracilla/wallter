'use strict'

const _ = require('lodash')
const axios = require('axios')
const restify = require('restify')
const BPromise = require('bluebird')
const mongoose = require('mongoose')

const halter = require('../../index').halter
const Builder = require('../../index').builder

require('../models/complex.model')()

let server
let conf = {}
let host = 'http://localhost:8080'

let builder = new Builder({
  uuid: true,
  model: mongoose.model('ComplexModel'),
  templates: {
    // overwrite or add message templates (see templates/messges.json)
    contains: `Value for field '%1$s' should contain '%2$s'.`,
    equals: `Value for field '%1$s' should equal to '%2$s'.`,
  }
})

describe('Server Test', function () {
  before('init', function (done) {
    let schema = builder
      .select('arr1d.*')
      .select('arr2d.*.*')
      .select('arr3d.*.*.*')
      .select('arr4d.*.*.*.*')
      .select('arr1dObj1.*.foo')
      .select('arr1dObj2.*.foo.bar')
      .select('arr1dObj3.*.foo.bar.beer')
      .select('arr2dObj1.*.*.foo')
      .select('arr2dObj2.*.*.foo.bar')
      .select('arrNest1.*.*.foo.bar.*.*')
      .select('arrNest2.*.foo.*.bar.*.beer.*')
      .build()

    server = restify.createServer({ name: 'myapp', version: '1.0.0'});
    server.use(restify.plugins.acceptParser(server.acceptable))
    server.use(restify.plugins.queryParser())
    server.use(restify.plugins.bodyParser())
    server.use(halter())

    server.post('/arr-test', function (req, res, next) {
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

  describe('# process nested arrays and objects', function () {
    it('should ok', function (done) {
      let data = {
        arr1d: [
          'a', 'b', 'c', {x: 'x'}, 'd'
        ],
        arr2d: [
          ['a', 'b'], 
          ['c', 'd', {x: 'x'}],
          ['e', 'f','g']
        ],
        arr3d: [
          [
            ['a', 'b', 'bc'],
            ['c', 'd'],
            ['x']
          ],
          [
            ['e', 'f'],
            ['g', 'h', {x: 'x'}],
          ],
        ],
        arr4d: [
          [
            [
              ['a', 'b', 'bc'],
              ['c', 'd'],
              ['x']
            ],
            [
              ['e', 'f'],
              ['g', 'h', {x: 'x'}],
            ],
          ],
          [
            [
              ['aa', 'bb', 'bbcc'],
              ['cc', 'dd'],
              ['xx']
            ],
            [
              ['ee', 'ff'],
              ['gg', 'hh', {xx: 'xx'}],
            ],
          ],
        ],

        arr1dObj1: [
          {foo: 'a'}, 
          {foo: 'b'},
          {foo: 'c'}
        ],
        arr1dObj2: [
          {foo: {bar: 'a', x: 'x'}},
          {foo: {bar: 'b'}}
        ],
        arr1dObj3: [
          {foo: {bar: {beer: 'aa'}}},
          {foo: {bar: {beer: 'bb', x: 'x'}}}
        ],

        arr2dObj1: [
          [{foo: 'a'}, {foo: 'b'}, {foo: 'c'}],
          [{foo: 'd'}, {foo: 'e'}, {foo: 'f'}]
        ],
        arr2dObj2: [
          [
            {foo: {bar: 'a'}},
            {foo: {bar: 'b'}}
          ],
          [
            {foo: {bar: 'aa'}},
            {foo: {bar: 'bb'}}
          ],
        ],

        arrNest1: [
          [
            {foo: {bar: [['a', 'b'], ['c', 'd']]}},
            {foo: {bar: [['e', 'f'], ['g', 'h']]}}
          ],
          [{foo: {bar: [['i', 'j'], ['k', 'l']]}}],
        ],
        arrNest2: [
          {
            foo: [
              {
                bar: [
                  {beer: ['a', 'b']},
                  {beer: ['c', 'd', 'dd']}
                ]
              },
              {
                bar: [
                  {beer: ['e', 'f', 'ff']},
                  {beer: ['g', 'h']}
                ]
              }
            ]
          },
          {
            foo: [
              {
                bar: [
                  {beer: ['i', 'j', {x: 'x'}]},
                  {beer: ['k', 'l']}
                ]
              },
              {
                bar: [
                  {beer: ['m', 'n']},
                  {beer: ['o', 'p']}
                ]
              }
            ]
          },
        ],
      }
      
      axios.post(`${host}/arr-test`, data, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data) && _.isEmpty(ret.data)) {
          done()
        }
      }).catch(console.log)
    })
  })
})

