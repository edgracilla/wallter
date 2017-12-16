/* global describe it before after */
'use strict'

const axios = require('axios')

describe('Server Test', function () {
  let host = 'http://localhost:8080'
  let conf = {}

  before('init', function (done) {
    require('./server')
    done()
  })

  after('terminate', function () {
    setTimeout(() => {
      process.exit(1)
    }, 300)
  })

  describe('# hot testing', function () {
    it('should ok', function (done) {
      let data = {
        // _id: '2218f0ad-c5e3-50dc-afcc-26325fd77398',
        // obj: {
        //   foo: 'foo'
        // },
        

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
          {foo: {bar: {nar: 'aa'}}},
          {foo: {bar: {nar: 'bb', x: 'x'}}}
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
                  {nar: ['a', 'b']},
                  {nar: ['c', 'd', 'dd']}
                ]
              },
              {
                bar: [
                  {nar: ['e', 'f', 'ff']},
                  {nar: ['g', 'h']}
                ]
              }
            ]
          },
          {
            foo: [
              {
                bar: [
                  {nar: ['i', 'j', {x: 'x'}]},
                  {nar: ['k', 'l']}
                ]
              },
              {
                bar: [
                  {nar: ['m', 'n']},
                  {nar: ['o', 'p']}
                ]
              }
            ]
          },
        ],
      }

      axios.post(`${host}/hot-test`, data, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          console.log(ret.data)
          // done()
        }
        done()
      }).catch(console.log)
    })
  })
})

