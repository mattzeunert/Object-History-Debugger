(function(){
    var objectHistoryDebugger = {
        trackAllObjects: true,
        _specificallyTrackedObjects: [],
        trackObject(obj){
            this._specificallyTrackedObjects.push(obj)
        },
        untrackObject(objToUntrack){
            this._specificallyTrackedObjects = this._specificallyTrackedObjects.filter(function(obj){
                return obj !== objToUntrack
            })
        },
        _isTrackingObject: function(obj){
            if (obj instanceof Storage){
                // PropertyHistory stored on Storage will be turned into strings
                return false;
            }
            if (this.trackAllObjects) {
                return true;
            }

            return this._specificallyTrackedObjects.indexOf(obj) !== -1
        }
    }

    var isMobile = navigator.userAgent.match(/iPhone|iPad|IEMobile|Android/)
    var isChrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
    var isFirefox = /firefox/.test(navigator.userAgent.toLowerCase());
    var isDesktopChrome = !isMobile && isChrome
    var canPrettyPrint = !isMobile && (isChrome || isFirefox)

    function resolveFrameWithTimeout(frameString, callback){
        var timedOut = false;
        var timer = setTimeout(function(){
            console.warn("Source mapping timed out", frameString)
            timedOut = true;
            callback(null, frameString)
        }, 30000)
        codePreprocessor.resolveFrame(frameString, function(){
            if (!timedOut){
                clearTimeout(timer)
                callback.apply(this, arguments)
            }
        })
    }

    function PropertyHistory(propertyName){
        Object.defineProperties(this, {
            propertyName: {
                value: propertyName,
                enumerable: false
            },
            fullHistory: {
                value: [],
                enumerable: false
            }
        })
    }
    PropertyHistory.prototype.clone = function(){
        return {
            fullHistory: this.fullHistory.slice().map(assignment => {
                return {
                    value: assignment.value,
                    stack: assignment.stack.slice()
                }
            })
        }
    }
    PropertyHistory.prototype.prettyPrint = function(moreThanOneLevelDeep){
        if (moreThanOneLevelDeep === undefined){
            moreThanOneLevelDeep = true;
        }

        if (!canPrettyPrint) {
            console.error("Pretty print only works in Chrome and Firefox")
            return;
        }
        console.info("Pretty print is asynchronous, so if you're paused in the debugger you first need to continue execution.")

        var args = arguments

        var fullHistory = this.clone().fullHistory;
        var self = this;

        var framesLeftToResolve = 0;


        var takingAWhileTimeout = null;
        if (moreThanOneLevelDeep){
            takingAWhileTimeout = setTimeout(function(){
                console.log("This seems to be taking a while. Call obj.prop__history__.prettyPrint(false) to only show a single call frame.")
            }, 2000)
        }

        fullHistory.forEach(function(assignment, assignmentIndex){
            assignment.stack.forEach(function(frameString, frameIndex){
                if (!moreThanOneLevelDeep){
                    if (frameIndex > 0) {
                        return
                    } else {
                        fullHistory[assignmentIndex].stack =  fullHistory[assignmentIndex].stack.slice(0, 1)
                    }
                }
                framesLeftToResolve++;

                resolveFrameWithTimeout(frameString, function(err, resolvedFrame){
                    framesLeftToResolve--;

                    fullHistory[assignmentIndex].stack[frameIndex] = resolvedFrame

                    if (framesLeftToResolve===0){
                        clearTimeout(takingAWhileTimeout)
                        self._log(fullHistory)

                        if (typeof args[0] === "function"){
                            // Automated tests use this to see when prettyprint is done
                            args[0]()
                        }
                    }
                })
            })
        })
    }
    PropertyHistory.prototype.prettyPrintSynchronously = function(){
        var hist = this;

        console.info("Pretty print synchronously will display history right away, but it won't apply source maps to show your original code.")

        this._log(hist.fullHistory)
    }
    PropertyHistory.prototype._log = function(fullHistory){
        var mostRecentAssignmentsMessage = "Most recent '" + this.propertyName + "' assignments:"
        if (isDesktopChrome){
            console.group("%c " + mostRecentAssignmentsMessage, "color: red; text-transform: uppercase; font-weight: bold; font-size: 10px")
        } else {
            console.log(String.fromCharCode(0x25BC) + " " + mostRecentAssignmentsMessage)
        }

        fullHistory.forEach((assignment, i) => {
            var frame = assignment.stack[0]
            if (typeof frame === "string"){
                console.log("[" + i + "] Set to ", assignment.value, frame)
            } else {
                console.log("[" + i + "] Set to ", assignment.value)
                logFrameObject(frame, false)
            }

            if (isDesktopChrome){
                console.groupCollapsed("%c MORE", "font-weight: bold; font-size: 7px;color: #777")
                assignment.stack.forEach(function(frame){
                    if (typeof frame === "string") {
                        console.log(frame)
                    } else if (typeof frame === "object") {
                        logFrameObject(frame, true)
                    }
                })
                console.groupEnd()
            }
        })
        if (isDesktopChrome) {
            console.groupEnd()
        }

        function logFrameObject(frame, isDetailed){
            var path = frame.fileName.replace(".dontprocess", "")
            var parts = path.split("/")
            var fileName = parts[parts.length - 1]
            console.log("Original location:", fileName + ":" + frame.lineNumber + ":" + frame.columnNumber)
            var line = frame.line
            if (line.length > 200){
                line = line.substr(frame.columnNumber, 200) + "..."
            }
            if (isDetailed){
                var previousLine = truncate(frame.prevLines[frame.prevLines.length - 1], 200)
                var nextLine = truncate(frame.nextLines[0], 200)
                if (previousLine){
                    console.log("###", previousLine)
                }
                console.log(">>>", line)
                if (nextLine) {
                    console.log("###", nextLine)
                }
            } else {
                console.log(line)
            }
        }
    }

    function truncate(str, maxLength){
        if (str === undefined) {
            str = ""
        }
        if (str.length < maxLength) {
            return str.length;
        } else {
            return str.substr(0, maxLength - 3) + "..."
        }
    }

    Object.defineProperty(PropertyHistory.prototype, "clickDotsToPrettyPrintSynchronously", {
        get: function(){
            this.prettyPrintSynchronously()
            return "Printed to console"
        },
        enumerable: true
    })
    Object.defineProperty(PropertyHistory.prototype, "clickDotsToPrettyPrint", {
        get: function(){
            this.prettyPrint()
            return "See console, note that pretty print is asynchronous"
        },
        enumerable: true
    })


    var nativeObjectGetOwnPropertyNames = Object.getOwnPropertyNames
    Object.getOwnPropertyNames = function(){
        // If DevTools calls it we want to show all names because
        // the __history__ properties should be visible to developer
        // We are checking stack to do that... works but possibly slow
        // and could break in future if DevTools/Chrome code changes
        var stack = Error().stack
        var calledFromDevTools =
            // console autocomplete
            stack.indexOf("getCompletions") !== -1
            // object inspector
            || (stack.indexOf("_propertyDescriptors") && stack.indexOf("InjectedScript") !== -1)

        var names = nativeObjectGetOwnPropertyNames.apply(this, arguments)
        if (calledFromDevTools) {
            return names
        } else {
            return names.filter(removeHistoryPropertyNames)
        }

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

    function propertyNameToString(propName){
        if (propName === null) {
            return "null"
        }
        if (propName === undefined) {
            return "undefined"
        }
        return propName.toString()
    }


    window.__ohdAssign = function(object, propertyName, value){
        if (objectHistoryDebugger._isTrackingObject(object)) {
            var propertyNameString = propertyNameToString(propertyName)

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

            addToHistory(object, propertyName, value)
        }

        return object[propertyName] = value
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
        addToHistory(object, propertyName, undefined)
        return delete object[propertyName]
    }

    function addToHistory(object, propertyName, value){
        var propertyNameString = propertyNameToString(propertyName);
        var storagePropName = propertyNameString + "__history__";

        if (object[storagePropName] === undefined){
            Object.defineProperty(object, storagePropName, {
                value: new PropertyHistory(propertyNameString),
                enumerable: false,
                writable: true
            })
        } else if (object[storagePropName].fullHistory === undefined){
            console.warn("Not tracking assignment", object, propertyName)
            return
        }

        Error.stackTraceLimit = 100
        var stack = Error().stack.split("\n")
        stack = stack.filter(frameString => {
            if (frameString === "Error" || frameString.indexOf("at Error (native)") !== -1) {
                return false;
            }
            if (frameString.indexOf("__ohd") !== -1) {
                return false;
            }
            if (frameString.indexOf("<anonymous>:") !== -1){
                return false;
            }
            if (frameString.indexOf("/ohd.js") !== -1) {
                return false;
            }
            return true;
        })

        object[storagePropName].fullHistory.unshift({
            stack,
            value
        })

        if (object[storagePropName].fullHistory.length > 20) {
            object[storagePropName].fullHistory.shift()
        }
    }

    if (typeof module !== "undefined"){
        module.exports = objectHistoryDebugger;
    } else {
        // Only needed for tests I think... we can get rid of it once we have
        // some kind of loader for Karma
        window.objectHistoryDebugger = objectHistoryDebugger
    }

})()
