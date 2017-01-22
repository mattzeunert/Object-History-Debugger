var CodePreprocessor = require("./CodePreprocessor").CodePreprocessor.default
var babelPlugin = require("./babel-plugin.js")
var resolveFrameWorkerAsString = require("./resolveFrameWorkerAsString.js")
var ohd = require("./ohd.js")

window.fromJSResolveFrameWorkerCode = resolveFrameWorkerAsString
window.codePreprocessor = new CodePreprocessor({babelPlugin})
window.codePreprocessor.enable()
window.f__useValue = function(v){return v}

module.exports = ohd
