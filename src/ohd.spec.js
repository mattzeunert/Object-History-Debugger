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


        expect(namesInWithHistory).toEqual(names)
    })

    it("Behaves like a normal object when getting Object.getOwnPropertyDescriptors", function(){
        var descriptors = Object.getOwnPropertyDescriptors(obj);
        var descriptorsInWithHistory = Object.getOwnPropertyDescriptors(objWithHistory);

        expect(Object.keys(descriptorsInWithHistory)).toEqual(Object.keys(descriptors))
    })

    describe("__ohdAssign", function(){
        it("Doesn't track assignments if trackAllObjects is disabled", function(){
            objectHistoryDebugger.trackAllObjects = false
            var o = {};
            __ohdAssign(o, "prop", 55)
            expect(o.prop__history__).toBe(undefined)
            expect(o.prop).toBe(55)
        })

        it("Tracks assignment if trackAllObjects is disabled but the specific object is tracked", function(){
            objectHistoryDebugger.trackAllObjects = false
            var o = {};
            objectHistoryDebugger.trackObject(o)
            __ohdAssign(o, "prop", 55)
            expect(typeof o.prop__history__).toBe("object")
            expect(o.prop).toBe(55)
        })

        it("Stops tracking objects when untrackObject is called", function(){
            objectHistoryDebugger.trackAllObjects = false
            var o = {};
            objectHistoryDebugger.trackObject(o)
            objectHistoryDebugger.untrackObject(o)
            __ohdAssign(o, "prop", 55)
            expect(typeof o.prop__history__).toBe("undefined")
            expect(o.prop).toBe(55)
        })

        it("Can correctly decide whether or not to track when multiple objects are involved", function(){
            objectHistoryDebugger.trackAllObjects = false
            var o1 = {};
            var o2 = {}
            objectHistoryDebugger.trackObject(o1)
            objectHistoryDebugger.trackObject(o2)
            objectHistoryDebugger.untrackObject(o1)
            __ohdAssign(o1, "prop", 22)
            __ohdAssign(o2, "prop", 33)
            expect(typeof o1.prop__history__).toBe("undefined")
            expect(typeof o2.prop__history__).toBe("object")
        })
    })


})
