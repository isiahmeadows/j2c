import {type, ARRAY, splitSelector} from './helpers'
import {sheet} from './sheet'
import {declarations} from './declarations'

/**
 * Hanldes at-rules
 *
 * @param {string} k - The at-rule name, and, if takes both parameters and a
 *                     block, the parameters.
 * @param {string[]} buf - the buffer in which the final style sheet is built
 * @param {string[]} v - Either parameters for block-less rules or their block
 *                       for the others.
 * @param {string} prefix - the current selector or a prefix in case of nested rules
 * @param {string} composes - as above, but without localization transformations
 * @param {string} vendors - a list of vendor prefixes
 * @Param {boolean} local - are we in @local or in @global scope?
 * @param {object} ns - helper functions to populate or create the @local namespace
 *                      and to @extend classes
 * @param {function} ns.e - @extend helper
 * @param {function} ns.l - @local helper
 */

export function at(k, v, buf, prefix, composes, vendors, local, ns){
  var i, kk
  if (/^@(?:-[-\w]+-)?(?:namespace|import|charset)$/.test(k)) {
    if(type.call(v) == ARRAY){
      for (kk = 0; kk < v.length; kk++) {
        buf.a(k, ' ', v[kk], ';\n')
      }
    } else {
      buf.a(k, ' ', v, ';\n')
    }
  } else if (/^@(?:-[-\w]+-)?keyframes /.test(k)) {
    k = local ? k.replace(
      // generated by script/regexps.js
      /( )(?::?global\(\s*([-\w]+)\s*\)|()([-\w]+))/,
      ns.l
    ) : k
    // add a @-webkit-keyframes block if no explicit prefix is present.
    if (/^@keyframes/.test(k)) {
      buf.a('@-webkit-', k.slice(1), ' {\n')
      sheet(v, buf, '', 1, ['webkit'])
      buf.c('}\n')
    }
    buf.a(k, ' {\n')
    sheet(v, buf, '', 1, vendors, local, ns)
    buf.c('}\n')

  } else if (/^@composes$/.test(k)) {
    if (!local) {
      buf.a('@-error-at-composes-in-at-global;\n')
      return
    }
    if (!composes) {
      buf.a('@-error-at-composes-no-nesting;\n')
      return
    }
    composes = splitSelector(composes)
    for(i = 0; i < composes.length; i++) {
      k = /^\s*\.(\w+)\s*$/.exec(composes[i])
      if (k == null) {
        // the last class is a :global(.one)
        buf.a('@-error-at-composes-bad-target ', JSON.stringify(composes[i]), ';\n')
        continue
      }
      ns.c(
        type.call(v) == ARRAY ? v.map(function (parent) {
          return parent.replace(/()(?::?global\(\s*\.?([-\w]+)\s*\)|()\.([-\w]+))/, ns.l)
        }).join(' ') : v.replace(/()(?::?global\(\s*\.?([-\w]+)\s*\)|()\.([-\w]+))/, ns.l),
        k[1]
      )
    }
  } else if (/^@(?:-[-\w]+-)?(?:font-face$|viewport$|page )/.test(k)) {
    if (type.call(v) === ARRAY) {
      for (kk = 0; kk < v.length; kk++) {
        buf.a(k, ' {\n')
        declarations(v[kk], buf, '', vendors, local, ns)
        buf.c('}\n')
      }
    } else {
      buf.a(k, ' {\n')
      declarations(v, buf, '', vendors, local, ns)
      buf.c('}\n')
    }

  } else if (/^@global$/.test(k)) {
    sheet(v, buf, prefix, 1, vendors, 0, ns)

  } else if (/^@local$/.test(k)) {
    sheet(v, buf, prefix, 1, vendors, 1, ns)

  } else if (/^@(?:-[-\w]+-)?(?:media |supports |document )./.test(k)) {
    buf.a(k, ' {\n')
    sheet(v, buf, prefix, 1, vendors, local, ns)
    buf.c('}\n')

  } else {
    buf.a('@-error-unsupported-at-rule ', JSON.stringify(k), ';\n')
  }
}
