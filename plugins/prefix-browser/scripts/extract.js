// TODO automate the extraction of the code parts from PrefixFree
// For now, we split it manually then add the relevant bits to make
// it all work.
var property = require('lodash.property')
var fs = require('fs')
var recast = require('recast')
var rimraf = require('rimraf')

var targetDir = 'src/extracted/'

rimraf.sync(targetDir + '*')

var names = []
var extras  = []

function indent(code) {
  return code.split('\n').map(line =>'\t' + line).join('\n')
}

var ast = recast.parse(fs.readFileSync('upstream/prefixfree/prefixfree.js').toString())

ast.program.body[
    1 // skip StyleFix
].expression.callee.body.body.forEach(function(statement){
  if (
        statement.type === 'ExpressionStatement' &&
        statement.expression.type === 'CallExpression' &&
        statement.expression.arguments.length === 0
    ) {
      var imports = ['fixers as self']
      var code = statement.expression.callee.body.body.map(recast.print).map(c=>c.code).join('\n')
      var name = statement.comments[0].value
        .replace(/\*|\n/g,'')
        .replace(/^ *| *$/g,'')
        .toLowerCase()
        .replace('@','at')
        .replace(/ +/g, '_')
        + '.js'
      names.push(name)
      if (/\broot\b/.test(code)) {
        imports.push('root')
      }
      if (/\bcamelCase\b/.test(code)) {
        code = code.replace(/StyleFix\./g, '')
        imports.push('camelCase')
      }
      if (/\bdeCamelCase\b/.test(code)) {
        code = code.replace(/StyleFix\./g, '')
        imports.push('deCamelCase')
      }
      if (/\bself\.prefixSelector\b/.test(code)) {
        code = code.replace(/\bself\.prefixSelector\b/, 'prefixSelector')
        imports.push('prefixSelector')
      }

      fs.writeFile(
        targetDir + name, 
        '// /!\\ this file is generated by the `script/extract.js` program, do not edit by hand\n\n' + 
        'import {' + imports.join(', ') + "} from '../fixers.js';\n\n" +
        "if (typeof getComputedStyle === 'function') new function() {\n" + 
        indent(code) +
        '\n}',
        function(err){
          if (err) {
            console.error(err)
            process.exit(1)
          }
        }
      )
    } else if (
      statement.type === 'ExpressionStatement' &&
      statement.expression.type === 'AssignmentExpression'
    ) {
      extras.push(statement)
    }
})

extras =
  '// /!\\ this file is generated by the `script/extract.js` program, do not edit by hand\n\n' +
  "import {root, fixers as self} from '../fixers.js'\n\n" +
  "if (typeof getComputedStyle === 'function') new function() {\n" + 
  indent(extras.map(recast.print).map(c=>c.code).join('\n')) +
  '\n}'

names.push('extras.js')

fs.writeFile(targetDir + 'extras.js', extras, function(err) {
  if (err) {
      console.error(err)
      process.exit(1)
    }
})




var imports =  [
  '// /!\\ this file is generated by the `script/extract.js` program, do not edit by hand\n',
  '// decorate the fixers object through the side effects of the various imports',
].concat(names.map(function(f){
  return 'import ' + JSON.stringify('./'+f)
})).join('\n')

fs.writeFile(targetDir + 'decorateFixers.js', imports, function(err) {
  if (err) {
      console.error(err)
      process.exit(1)
    }
})

