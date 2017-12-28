/* global describe, it, after, before */
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

  describe('# no location -- no value -- per item', function () {
    it('should halt _id', function (done) {
      axios.post(`${host}/noloc/_id`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false
          let cond2 = false

          ret.data.forEach(item => {
            if (/_id.*valid UUIDv/.test(item.message)) cond1 = true
            if (/_id.*is required/.test(item.message)) cond2 = true
          })

          if (cond1 && cond2) done()
        }
      }).catch(console.log)
    })

    it('should halt email', function (done) {
      axios.post(`${host}/noloc/email`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false
          let cond2 = false

          ret.data.forEach(item => {
            if (/email.*valid email/.test(item.message)) cond1 = true
            if (/email.*is required/.test(item.message)) cond2 = true
          })

          if (cond1 && cond2) done()
        }
      }).catch(console.log)
    })

    it('should halt minlength', function (done) {
      axios.post(`${host}/noloc/minlength`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false
          let cond2 = false

          ret.data.forEach(item => {
            if (/minlength.*atleast.*character/.test(item.message)) cond1 = true
            if (/minlength.*is required/.test(item.message)) cond2 = true
          })

          if (cond1 && cond2) done()
        }
      }).catch(console.log)
    })

    it('should halt empty maxlength', function (done) {
      axios.post(`${host}/noloc/maxlength`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false

          ret.data.forEach(item => {
            if (/maxlength.*is required/.test(item.message)) cond1 = true
          })

          if (cond1) done()
        }
      }).catch(console.log)
    })

    it('should halt maxlength - exceeded chars', function (done) {
      axios.post(`${host}/noloc/maxlength`, {maxlength: 'thebigbrownfoxjumpsoverthelazydog'}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false

          ret.data.forEach(item => {
            if (/maxlength.*exceed.*character/.test(item.message)) cond1 = true
          })

          if (cond1) done()
        }
      }).catch(console.log)
    })

    it('should halt enums', function (done) {
      axios.post(`${host}/noloc/enums`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false
          let cond2 = false

          ret.data.forEach(item => {
            if (/enums.*is required/.test(item.message)) cond1 = true
            if (/enums.*Expecting/.test(item.message)) cond2 = true
          })

          if (cond1 && cond2) done()
        }
      }).catch(console.log)
    })

    it('should halt ref', function (done) {
      axios.post(`${host}/noloc/ref`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false
          let cond2 = false

          ret.data.forEach(item => {
            if (/ref.*valid UUIDv/.test(item.message)) cond1 = true
            if (/ref.*is required/.test(item.message)) cond2 = true
          })

          if (cond1 && cond2) done()
        }
      }).catch(console.log)
    })

    it('should halt arrRef.*', function (done) {
      axios.post(`${host}/noloc/arrRef.*`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false
          let cond2 = false

          ret.data.forEach(item => {
            if (/arrRef\.\*.*valid UUIDv/.test(item.message)) cond1 = true
            if (/arrRef\.\*.*is required/.test(item.message)) cond2 = true
          })

          if (cond1 && cond2) done()
        }
      }).catch(console.log)
    })

    it('should halt arr.*', function (done) {
      axios.post(`${host}/noloc/arr.*`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false

          ret.data.forEach(item => {
            if (/arr\.\*.*is required/.test(item.message)) cond1 = true
          })

          if (cond1) done()
        }
      }).catch(console.log)
    })

    it('should halt obj.foo', function (done) {
      axios.post(`${host}/noloc/obj.foo`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false

          ret.data.forEach(item => {
            if (/obj\.foo.*is required/.test(item.message)) cond1 = true
          })

          if (cond1) done()
        }
      }).catch(console.log)
    })

    it('should halt obj.bar', function (done) {
      axios.post(`${host}/noloc/obj.bar`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false

          ret.data.forEach(item => {
            if (/obj\.bar.*is required/.test(item.message)) cond1 = true
          })

          if (cond1) done()
        }
      }).catch(console.log)
    })

    it('should halt arrObj.*.foo', function (done) {
      axios.post(`${host}/noloc/arrObj.*.foo`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false

          ret.data.forEach(item => {
            if (/arrObj\.\*\.foo.*is required/.test(item.message)) cond1 = true
          })

          if (cond1) done()
        }
      }).catch(console.log)
    })

    it('should halt arrObj.*.bar', function (done) {
      axios.post(`${host}/noloc/arrObj.*.bar`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false

          ret.data.forEach(item => {
            if (/arrObj\.\*\.bar.*is required/.test(item.message)) cond1 = true
          })

          if (cond1) done()
        }
      }).catch(console.log)
    })

    it('should halt arrArr.*.*', function (done) {
      axios.post(`${host}/noloc/arrArr.*.*`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false

          ret.data.forEach(item => {
            if (/arrArr\.\*\.\*.*is required/.test(item.message)) cond1 = true
          })

          if (cond1) done()
        }
      }).catch(console.log)
    })

    it('should halt arrArrObj.*.*.foo', function (done) {
      axios.post(`${host}/noloc/arrArrObj.*.*.foo`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false

          ret.data.forEach(item => {
            if (/arrArrObj\.\*\.\*\.foo.*is required/.test(item.message)) cond1 = true
          })

          if (cond1) done()
        }
      }).catch(console.log)
    })

    it('should halt arrObjArr.*.foo.*', function (done) {
      axios.post(`${host}/noloc/arrObjArr.*.foo.*`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false

          ret.data.forEach(item => {
            if (/arrObjArr\.\*\.foo\.\*.*is required/.test(item.message)) cond1 = true
          })

          if (cond1) done()
        }
      }).catch(console.log)
    })

    it('should halt arrObjArrObj.*.foo.*.bar', function (done) {
      axios.post(`${host}/noloc/arrObjArrObj.*.foo.*.bar`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false

          ret.data.forEach(item => {
            if (/arrObjArrObj\.\*\.foo\.\*\.bar.*is required/.test(item.message)) cond1 = true
          })

          if (cond1) done()
        }
      }).catch(console.log)
    })

    it('should halt arrObjArrObj.*.moo.*.nar', function (done) {
      axios.post(`${host}/noloc/arrObjArrObj.*.moo.*.nar`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false

          ret.data.forEach(item => {
            if (/arrObjArrObj\.\*\.moo\.\*\.nar.*is required/.test(item.message)) cond1 = true
          })

          if (cond1) done()
        }
      }).catch(console.log)
    })

    it('should halt arrObjArrObjObj.*.foo.*.bar.beer', function (done) {
      axios.post(`${host}/noloc/arrObjArrObjObj.*.foo.*.bar.beer`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false

          ret.data.forEach(item => {
            if (/arrObjArrObjObj\.\*\.foo\.\*\.bar\.beer.*is required/.test(item.message)) cond1 = true
          })

          if (cond1) done()
        }
      }).catch(console.log)
    })

    it('should halt arrObjArrObjObj.*.fooo.*.barr.beerr', function (done) {
      axios.post(`${host}/noloc/arrObjArrObjObj.*.fooo.*.barr.beerr`, {}, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          let cond1 = false

          ret.data.forEach(item => {
            if (/arrObjArrObjObj\.\*\.fooo\.\*\.barr\.beerr.*is required/.test(item.message)) cond1 = true
          })

          if (cond1) done()
        }
      }).catch(console.log)
    })
  })

  /**
   * location (body, params, query)
   * optional/required
   *
   */
})
