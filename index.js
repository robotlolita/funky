require('ometajs');
const { FunkyParser } = require('./parser.ometajs');
const { FunkyCompiler } = require('./compiler.ometajs');
const { evaluate } = require('./interpreter');

const stdlib = `
function _print(value) {
  if (arguments.length !== 1) { throw new Error('print expects 1 argument') }
  console.log(value);
}
`

function parse(code) {
  return FunkyParser.matchAll(code, 'Program');
}

function compile(ast) {
  return stdlib + '\n\n' + FunkyCompiler.match(ast, 'compile') + '\n\n_main()';
}

function run(code) {
  "use strict";
  return eval(compile(parse(code)));
}

module.exports = {
  parse, compile, interpret: evaluate, run
};
