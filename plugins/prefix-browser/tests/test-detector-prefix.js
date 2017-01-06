var o = require('ospec')

var exposed = require('../test-utils/exposed')
var mocks = require('../test-utils/mocks')
var upToDate = require('../test-utils/misc').upToDate

var init = exposed.init
var finalize = exposed.finalize
var detectPrefix = exposed.detectPrefix
var blankFixers = exposed.blankFixers

var referenceFixers = Object.keys(blankFixers())


o.spec('detectPrefix', function() {
  var fixers
  o.beforeEach(function() {
    fixers = blankFixers()
  })
  o.afterEach(function() {
    if (typeof global.cleanupMocks === 'function') global.cleanupMocks()
    // no key was added at run time (that would cause deopts)
    o(Object.keys(fixers)).deepEquals(referenceFixers)
    fixers = null
  })

  o('build up to date', function() {
    o(upToDate(__dirname, '../src/detectors/prefix.js')).equals(true)
  })

  o('no properties', function() {
    mocks(global)
    init()
    detectPrefix(fixers)
    finalize()

    o(fixers.prefix).equals('')
  })
  o('properties without a prefix', function() {
    mocks(global, {
      properties: {
        color: 'red',
        width: '0'
      }
    })
    init()
    detectPrefix(fixers)
    finalize()

    o(fixers.prefix).equals('')
  })
  o('properties with a single prefix', function() {
    mocks(global, {
      properties: {
        MozColor: 'red',
        width: '0'
      }
    })
    init()
    detectPrefix(fixers)
    finalize()

    o(fixers.prefix).equals('-moz-')
  })
  o('properties with two prefixes', function() {
    mocks(global, {
      properties: {
        MozColor: 'red',
        MozMargin: '0',
        OMargin: '0',
        width: '0'
      }
    })
    init()
    detectPrefix(fixers)
    finalize()

    o(fixers.prefix).equals('-moz-')
  })
})