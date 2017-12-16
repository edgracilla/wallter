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
        arrObj: [{
          foo: 'aa',
          bar: 'bb',
        }],
        // arrObj: []
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

