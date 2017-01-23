// Webpack uses `(function() { return this; }()))` to get a reference to the
// global object. But that doesn't work in strict mode, such as when
// embedded Webpack JS code is loaded by another Webpack compiled bundle

var fs = require("fs")

var code = fs.readFileSync("./dist/ohd.js").toString()
code = code.replace(/\(function\(\) \{ return this; \}\(\)\)/g, "window")

fs.writeFileSync("./dist/ohd.js", code)
