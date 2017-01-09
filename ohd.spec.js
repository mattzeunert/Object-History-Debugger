describe("Object History Debugger", function(){
    var objWithHistory = __ohdMakeObject([['ObjectProperty', 'age', 77]])
    var obj = {age: 77}

    it("Has an age__history__ property", function(){
        expect(objWithHistory.age__history__).not.toBe(undefined)
    })

    it("Behaves like a normal object in forEach", function(){
        var keys = [];
        var keysInWithHistory = [];
        for (key in obj) {
            keys.push(key)
        }
        for (key in objWithHistory) {
            keysInWithHistory.push(key)
        }

        expect(keys).toEqual(keysInWithHistory)
    })

    it("Behaves like a normal object when getting Object.keys", function(){
        var keys = Object.keys(obj);
        var keysInWithHistory = Object.keys(objWithHistory);

        expect(keys).toEqual(keysInWithHistory)
    })

    it("Behaves like a normal object when getting Object.getOwnPropertyNames", function(){
        var names = Object.getOwnPropertyNames(obj);
        var namesInWithHistory = Object.getOwnPropertyNames(objWithHistory);

        expect(names).toEqual(namesInWithHistory)
    })

    it("Behaves like a normal object when getting Object.getOwnPropertyDescriptors", function(){
        var descriptors = Object.getOwnPropertyDescriptors(obj);
        var descriptorsInWithHistory = Object.getOwnPropertyDescriptors(objWithHistory);

        expect(Object.keys(descriptors)).toEqual(Object.keys(descriptorsInWithHistory))
    })
})
