var ohd = require("object-history-debugger")

describe("", function(){
    it("Tracks assignments", function(){
        var obj = {x: 10}
        obj.x = 44
        obj.x = 11

        expect(obj.x__history__.fullHistory.length).toBe(3)
    })
})
