// Build command:
// webpack ./ohd-with-babel.js ./dist/ohd.js --watch

var CodePreprocessor = require("./CodePreprocessor")
var babelPlugin = require("./babel-plugin.js")
var resolveFrameWorkerAsString = require("./resolveFrameWorkerAsString.js")
require("./ohd.js")

window.fromJSResolveFrameWorkerCode = resolveFrameWorkerAsString
window.codePreprocessor = new __odpCodePreprocessorClass({babelPlugin})
window.f__useValue = function(v){return v}
