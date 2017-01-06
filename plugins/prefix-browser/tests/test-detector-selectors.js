var o = require('ospec')

var exposed = require('../test-utils/exposed')
var mocks = require('../test-utils/mocks')
var upToDate = require('../test-utils/misc').upToDate

var init = exposed.init
var finalize = exposed.finalize
var detectSelectors = exposed.detectSelectors
var blankFixers = exposed.blankFixers

var referenceFixers = Object.keys(blankFixers())
"::input-placeholder","::placeholder", ":input-placeholder",":placeholder", 

o.spec('detectSelectors', function() {
  var fixers
  o.beforeEach(function() {
    fixers = blankFixers()
  })
  o.afterEach(function() {
    if (typeof global.cleanupMocks === 'function') global.cleanupMocks()
    o(Object.keys(fixers)).deepEquals(referenceFixers)
    fixers = null
  })

  o('build up to date', function() {
    o(upToDate(__dirname, '../src/detectors/selectors.js')).equals(true)
  })

  o('works when no prefix are supported', function(){
    mocks(global)
    init()
    detectSelectors(fixers)
    finalize()

    o(fixers.selectors.length).equals(0)
    o(fixers.placeholder).equals(null)
  })
  o('works with a prefix but no valid selector', function(){
    mocks(global)
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectors.length).equals(0)
    o(fixers.placeholder).equals(null)
  })
  o('works with a prefix and unprefixed selectors', function(){
    mocks(global, {rules: [
      ':any-link{}', ':read-only{}', ':read-write{}', '::selection{}'
    ]})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectors.length).equals(0)
    o(fixers.placeholder).equals(null)
  })
  o('works with a prefix and prefixed selectors', function(){
    mocks(global, {rules: [
      ':-o-any-link{}',':-o-read-only{}', ':-o-read-write{}', '::-o-selection{}'
    ]})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectors.sort()).deepEquals(["::selection", ":any-link", ':read-only', ':read-write'])
    o(fixers.placeholder).equals(null)
  })

  o('works with a prefix and both prefixed and unprefixed selectors', function(){
    mocks(global, {rules: [
      ':any-link{}', ':read-only{}', ':read-write{}', '::selection{}',
      ':-o-any-link{}',':-o-read-only{}', ':-o-read-write{}', '::-o-selection{}'
    ]})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectors.length).equals(0)
    o(fixers.placeholder).equals(null)
  })
  o(':placeholder', function() {
    mocks(global, {rules: [':placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()
    o(fixers.selectors.length).equals(0)
    o(fixers.placeholder).equals(null)
  })
  o('::placeholder', function() {
    mocks(global, {rules: [':placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()
    o(fixers.selectors.length).equals(0)
    o(fixers.placeholder).equals(null)
  })
  o(':input-placeholder', function() {
    mocks(global, {rules: [':placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()
    o(fixers.selectors.length).equals(0)
    o(fixers.placeholder).equals(null)
  })
  o('::input-placeholder', function() {
    mocks(global, {rules: [':placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()
    o(fixers.selectors.length).equals(0)
    o(fixers.placeholder).equals(null)
  })
  o(':-o-placeholder', function() {
    mocks(global, {rules: [':-o-placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()
    o(fixers.selectors).deepEquals(['::placeholder'])
    o(fixers.placeholder).equals(':-o-placeholder')
  })
  o('::-o-placeholder', function() {
    mocks(global, {rules: ['::-o-placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()
    o(fixers.selectors).deepEquals(['::placeholder'])
    o(fixers.placeholder).equals('::-o-placeholder')
  })
  o(':-o-input-placeholder', function() {
    mocks(global, {rules: [':-o-input-placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()
    o(fixers.selectors).deepEquals(['::placeholder'])
    o(fixers.placeholder).equals(':-o-input-placeholder')
  })
  o('::-o-input-placeholder', function() {
    mocks(global, {rules: ['::-o-input-placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()
    o(fixers.selectors).deepEquals(['::placeholder'])
    o(fixers.placeholder).equals('::-o-input-placeholder')
  })
})