function HistoryEntry(propertyName){
    this.lastAssignment = null;
    this.fullHistory = [];
    this.propertyName = propertyName
}
HistoryEntry.prototype.clone = function(){
    return {
        fullHistory: this.fullHistory.slice().map(assignment => {
            return {
                value: assignment.value,
                stack: assignment.stack.slice()
            }
        })
    }
}
HistoryEntry.prototype.prettyPrint = function(){
    var fullHistory = this.clone().fullHistory;
    var self = this;

    var framesLeftToResolve = 0;

    fullHistory.forEach(function(assignment, assignmentIndex){
        assignment.stack.forEach(function(frameString, frameIndex){
            framesLeftToResolve++;

            codePreprocessor.resolveFrame(frameString, function(err, resolvedFrame){
                framesLeftToResolve--;

                fullHistory[assignmentIndex].stack[frameIndex] = resolvedFrame

                if (framesLeftToResolve===0){
                    console.log("done")
                    self._log(fullHistory)
                }
            })
        })
    })
}
HistoryEntry.prototype.prettyPrintSortOf = function(){
    var hist = this;

    this._log(hist.fullHistory)
}
HistoryEntry.prototype._log = function(fullHistory){
    console.group("%c Most recent '" + this.propertyName + "' assignments:", "color: red; text-transform: uppercase; font-weight: bold; font-size: 10px")
    fullHistory.forEach((assignment, i) => {
        var frame = assignment.stack[0]
        if (typeof frame === "string"){
            console.log("[" + i + "] Set to ", assignment.value, frame)
        } else {
            console.log("[" + i + "] Set to ", assignment.value)
            logFrameObject(frame, false)
        }

        console.groupCollapsed("%c MORE", "font-weight: bold; font-size: 7px;color: #777")
        assignment.stack.forEach(function(frame){
            if (typeof frame === "string") {
                console.log(frame)
            } else if (typeof frame === "object") {
                logFrameObject(frame, true)
            }
        })
        console.groupEnd()
    })
    console.groupEnd()

    function logFrameObject(frame, isDetailed){
        var path = frame.fileName.replace(".dontprocess", "")
        var parts = path.split("/")
        var fileName = parts[parts.length - 1]
        console.log("Original location:", fileName + ":" + frame.lineNumber + ":" + frame.columnNumber)
        if (isDetailed){
            var previousLine = frame.prevLines[frame.prevLines.length - 1]
            var nextLine = frame.nextLines[0]
            if (previousLine){
                console.log("###", previousLine)
            }
            console.log(">>>", frame.line)
            if (nextLine) {
                console.log("###", nextLine)
            }
        } else {
            console.log(frame.line)
        }
    }
}
Object.defineProperty(HistoryEntry.prototype, "clickDotsToPrettyPrintSortOf", {
    get: function(){
        this.prettyPrintSortOf()
        return "Printed to console"
    }
})


var nativeObjectGetOwnPropertyNames = Object.getOwnPropertyNames
Object.getOwnPropertyNames = function(){
    var names = nativeObjectGetOwnPropertyNames.apply(this, arguments)
    return names.filter(removeHistoryPropertyNames)

    function removeHistoryPropertyNames(name){
        return name.indexOf("__history__") === -1
    }
}

var nativeObjectGetOwnPropertyDescriptors = Object.getOwnPropertyDescriptors
Object.getOwnPropertyDescriptors = function(){
    var descriptors = nativeObjectGetOwnPropertyDescriptors.apply(this, arguments)
    var ret = {}
    for (key in descriptors) {
        if (key.indexOf("__history__") === -1) {
            ret[key] = descriptors[key]
        }
    }

    return ret
}


window.__ohdAssign = function(object, propertyName, value){
    var propertyNameString = propertyName.toString()

    var propertyNameType = typeof propertyName;
    // Either Symbol() or Object(Symbol())
    var propertyNameIsSymbol = propertyNameType === "symbol" || propertyNameString === "Symbol()"
    if (!propertyNameIsSymbol) {
        if (propertyName === null
            || propertyName === undefined
            || (propertyNameType !== "string")) {
            propertyName = propertyNameString;
        }
    }

    addHistoryEntry(object, propertyName, value)

    return object[propertyName] = value
}

function addHistoryEntry(object, propertyName, value){
    var propertyNameString = propertyName.toString();
    var storagePropName = propertyNameString + "__history__";

    if (object[storagePropName] === undefined){
        Object.defineProperty(object, storagePropName, {
            value: new HistoryEntry(propertyNameString),
            enumerable: false,
            writable: true
        })
    }

    Error.stackTraceLimit = 100
    var stack = Error().stack.split("\n")
    stack = stack.filter(frameString => {
        if (frameString === "Error") {
            return false;
        }
        if (frameString.indexOf("__ohd") !== -1) {
            return false;
        }
        if (frameString.indexOf("<anonymous>:") !== -1){
            return false;
        }
        return true;
    })

    object[storagePropName].lastAssignment = stack[0]
    object[storagePropName].fullHistory.unshift({
        stack,
        value
    })

    if (object[storagePropName].fullHistory.length > 20) {
        object[storagePropName].fullHistory = object[storagePropName].fullHistory.slice(0, 20)
    }
}

window.__ohdMakeObject = function(properties){
    var obj = {}
    var methodProperties = {};
    for (var i=0; i< properties.length ;i++){
        var property =  properties[i]
        var propertyType = property[0]
        var propertyKey = property[1]
        if (propertyType === "ObjectProperty") {
            __ohdAssign(obj, property[1], property[2])
        } else if (propertyType === "ObjectMethod") {
            var propertyKind = property[2]
            var fn = property[3]
            if (!methodProperties[propertyKey]){
                methodProperties[propertyKey] = {
                    enumerable: true,
                    configurable: true
                }
            }
            methodProperties[propertyKey][propertyKind] = fn

        }
    }
    Object.defineProperties(obj, methodProperties)
    return obj
}

window.__ohdDeleteProperty = function(object, propertyName){
    addHistoryEntry(object, propertyName, undefined)
    return delete object[propertyName]
}
