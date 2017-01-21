describe("Babel Plugin", function(){
    var transform = function(code){
        return Babel.transform(code, {
            plugins: [window.babelPlugin]
        }).code
    }

    it("Converts object literals to __ohdMakeObject calls", function(){
        var transformed = transform("var a = {sth: 55}")
        expect(transformed).toBe("var a = __ohdMakeObject([[\"ObjectProperty\", \"sth\", 55]]);")
    })

    it("Converts assignment operations that change value on the left to simple assignments", function(){
        var transformed = transform("a += 10")
        expect(transformed).toBe("a = a + 10;")
    })

    describe("delete expressions", function(){
        it("Converts delete expressions to __ohdDeleteProperty calls", function(){
            var transformed = transform("delete obj.sth")
            expect(transformed).toBe("__ohdDeleteProperty(obj, \"sth\");")
        })
    })
})
