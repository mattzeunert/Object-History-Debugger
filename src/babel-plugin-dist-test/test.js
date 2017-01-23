var ohd = require("object-history-debugger")

var logs = []
var nativeConsoleLog = console.log
console.log = function(){
    logs.push(arguments)
    return nativeConsoleLog.apply(this, arguments)
}

describe("Object History Debugger NPM Module", function(){
    var obj = {x: 10}
    obj.x = 44
    obj.x = 11

    it("Tracks assignments", function(){
        expect(obj.x__history__.fullHistory.length).toBe(3)
    })

    it("Can prettyPrintSynchronously", function(){
        obj.x__history__.prettyPrintSynchronously();
        expect(logs[0][0]).toBe("[0] Set to ")
        expect(logs[0][1]).toBe(11)
    })

    it("Can resolve frames with codePreprocessor", function(done){
        // Doing this first so the source map is pre-loaded
        codePreprocessor.resolveFrame("    at Suite.<anonymous> (http://localhost:9886/base/dist/test.js:59:6)", function(err, res){
            expect(res.line).toBe("    obj.x = 11")
            done()
        })
    })

    it("Can prettyPrint", function(done){
        logs = [];

        obj.x__history__.prettyPrint(function(){
            expect(JSON.stringify(logs).indexOf(" var obj = {x: 10}")).not.toBe(-1);
            done()
        })
    })
})
