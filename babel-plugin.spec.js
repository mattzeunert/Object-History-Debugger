describe("Babel Plugin", function(){
    var transform = function(code){
        return Babel.transform(code, {
            plugins: [window.babelPlugin]
        }).code
    }

    it("Converts object literals to __ohdMakeObject calls", function(){
        debugger
        var transformed = transform("var a = {sth: 55}")
        expect(transformed).toBe("var a = __ohdMakeObject([[\"ObjectProperty\", \"sth\", 55]]);")
    })
})
