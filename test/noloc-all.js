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

  let isOutputOk = (results) => {
    let hasErr = []

    for(var i = 0; i < 34; i++) {
      hasErr.push(false)
    }

    results.forEach((item, i) => {
      if (/_id.*valid UUIDv/.test(item.message)) hasErr[i] = true
      if (/_id.*is required/.test(item.message)) hasErr[i] = true
      if (/email.*valid email/.test(item.message)) hasErr[i] = true
      if (/email.*is required/.test(item.message)) hasErr[i] = true
      if (/minlength.*atleast.*character/.test(item.message)) hasErr[i] = true
      if (/minlength.*is required/.test(item.message)) hasErr[i] = true
      if (/maxlength.*is required/.test(item.message)) hasErr[i] = true
      if (/minmaxlength.*is required/.test(item.message)) hasErr[i] = true
      if (/enums.*is required/.test(item.message)) hasErr[i] = true
      if (/enums.*Expecting/.test(item.message)) hasErr[i] = true

      if (/ref.*valid UUIDv/.test(item.message)) hasErr[i] = true
      if (/ref.*is required/.test(item.message)) hasErr[i] = true
      if (/arrRef\.\*.*valid UUIDv/.test(item.message)) hasErr[i] = true
      if (/arrRef\.\*.*is required/.test(item.message)) hasErr[i] = true
      if (/arr\.\*.*is required/.test(item.message)) hasErr[i] = true
      if (/obj\.foo.*is required/.test(item.message)) hasErr[i] = true
      if (/obj\.bar.*is required/.test(item.message)) hasErr[i] = true
      if (/arrObj\.\*\.foo.*is required/.test(item.message)) hasErr[i] = true
      if (/arrObj\.\*\.bar.*is required/.test(item.message)) hasErr[i] = true

      if (/arrArr\.\*\.\*.*is required/.test(item.message)) hasErr[i] = true
      if (/arrArrObj\.\*\.\*\.foo.*is required/.test(item.message)) hasErr[i] = true
      if (/arrObjArr\.\*\.foo\.\*.*is required/.test(item.message)) hasErr[i] = true
      if (/arrObjArrObj\.\*\.foo\.\*\.bar.*is required/.test(item.message)) hasErr[i] = true
      if (/arrObjArrObj\.\*\.moo\.\*\.nar.*is required/.test(item.message)) hasErr[i] = true
      if (/arrObjArrObjObj\.\*\.foo\.\*\.bar\.beer.*is required/.test(item.message)) hasErr[i] = true
      if (/arrObjArrObjObj\.\*\.fooo\.\*\.barr\.beerr.*is required/.test(item.message)) hasErr[i] = true
      
      if (/schemaObj\.foo.*is required/.test(item.message)) hasErr[i] = true
      if (/schemaObj\.bar.*is required/.test(item.message)) hasErr[i] = true
      if (/schemaObjArr\.\*\.foo.*is required/.test(item.message)) hasErr[i] = true
      if (/schemaObjArr\.\*\.bar.*is required/.test(item.message)) hasErr[i] = true
      if (/schemaObjArrObjArr\.\*\.foo\.\*.*is required/.test(item.message)) hasErr[i] = true
      if (/schemaObjArrObjArr\.\*\.bar\.\*.*is required/.test(item.message)) hasErr[i] = true
      if (/schemaObjArrSchemaObj\.\*\.foo\.foo.*is required/.test(item.message)) hasErr[i] = true
      if (/schemaObjArrSchemaObj\.\*\.foo\.bar.*is required/.test(item.message)) hasErr[i] = true
    })

    let hasFalse = false

    hasErr.forEach((value, i) => {
      if (!value) {
        hasFalse = true
        console.log(i, value, results[i])
      }
    })

    return !hasFalse
  }

  /* describe('# no value -- all fields', function () {
    it('should halt all -- noloc', function (done) {
      this.timeout(5000)

      axios.post(`${host}/nolocall`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          if (isOutputOk(ret.data)) done()
        }
      }).catch(console.log)
    })

    it('should halt all -- body', function (done) {
      this.timeout(5000)

      axios.post(`${host}/body`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          if (isOutputOk(ret.data)) done()
        }
      }).catch(console.log)
    })

    it('should halt all -- query', function (done) {
      this.timeout(5000)

      axios.post(`${host}/query`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          if (isOutputOk(ret.data)) done()
        }
      }).catch(console.log)
    })

    it('should halt all -- params', function (done) {
      this.timeout(5000)

      axios.post(`${host}/params`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          if (isOutputOk(ret.data)) done()
        }
      }).catch(console.log)
    })
  }) */

  describe('# with valid values -- all fields', function () {
    it('should not halt all -- noloc', function (done) {
      this.timeout(5000)

      let data = {
        _id: '2218f0ad-c5e3-50dc-afcc-26325fd77398',
        email: 'foo@bar.com',
        minlength: 'foobar',
        maxlength: 'foo',
        minmaxlength: 'foo', // !
        enums: 'jhon',

        ref:  '2218f0ad-c5e3-50dc-afcc-26325fd77398',
        arrRef: [ '2218f0ad-c5e3-50dc-afcc-26325fd77398'],

        arr: ['foo'],
        obj: {
          foo: 'foo',
          bar: 'bar'
        },
        arrObj: [{
          foo: 'foo',
          bar: 'bar'
        }],
        arrArr:[['foo']],
        arrArrObj:[[{
          foo: 'foo'
        }]],
        arrObjArr: [{
          foo: ['foo']
        }],
        
        arrObjArrObj: [{
          foo: [{
            bar: 'bar'
          }]
        }],

        schemaObj: {
          foo: 'foo',
          bar: 'bar',
        },
        schemaObjArr: [{
          foo: 'foo',
          foo: 'bar',
        }],
        // schemaObjArrObjArr: [{
        //   foo: ['foo'],
        //   bar: ['bar'],
        // }]
      }

      axios.post(`${host}/nolocall`, data, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          console.log('\n', ret.data)
          // if (isOutputOk(ret.data)) done()
          done()
        }
      }).catch(console.log)
    })
  })
})

