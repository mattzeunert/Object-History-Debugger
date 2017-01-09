var codeInstrumenter = new ChromeCodeInstrumenter({});

function onBrowserActionClicked(tab) {
    codeInstrumenter.toggleTabInstrumentation(tab.id, {
        babelPlugin: function(babel) {
            return {
                visitor: {
                    ObjectExpression(path) {

                        path.node.properties.forEach(function(prop){
                          if (prop.key.type === "Identifier") {
                              var keyLoc = prop.key.loc
                              prop.key = babel.types.stringLiteral(prop.key.name)
                              prop.key.loc = keyLoc
                              // move start a bit to left to compensate for there not
                              // being quotes in the original "string", since
                              // it's just an identifier
                              if (prop.key.loc.start.column > 0) {
                                  prop.key.loc.start.column--;
                              }
                          }
                        })

                        var call = babel.types.callExpression(
                            babel.types.identifier("__ohdMakeObject"), [babel.types.arrayExpression(
                                path.node.properties.map(function(prop) {
                                    var type = babel.types.stringLiteral(prop.type)
                                    type.ignore = true
                                    if (prop.type === "ObjectMethod") {
                                        // getter/setter
                                        var kind = babel.types.stringLiteral(prop.kind);
                                        kind.ignore = true;
                                        var propArray = babel.types.arrayExpression([
                                            type,
                                            prop.key,
                                            kind,
                                            babel.types.functionExpression(
                                                null,
                                                prop.params,
                                                prop.body
                                            )
                                        ])
                                        return propArray
                                    } else {
                                        var propArray = babel.types.arrayExpression([
                                            type,
                                            prop.key,
                                            prop.value
                                        ])
                                        return propArray
                                    }
                                    console.log("continue with type", prop.type)
                                })
                            )]
                        )
                        path.replaceWith(call)
                    },
                    AssignmentExpression(path) {
                        if (path.node.ignore) {
                            return
                        }

                        if (path.node.operator === "=" && path.node.left.type === "MemberExpression") {
                            var property;
                            if (path.node.left.computed === true) {
                                property = path.node.left.property
                            } else {
                                property = babel.types.stringLiteral(path.node.left.property.name)
                                property.loc = path.node.left.property.loc
                            }
                            var assignExpression = babel.types.callExpression(
                                babel.types.identifier("__ohdAssign"), [
                                    path.node.left.object,
                                    property,
                                    path.node.right
                                ]
                            )
                            assignExpression.loc = path.node.loc
                            path.replaceWith(assignExpression)
                        }
                    },
                }
            }
        },
        jsExecutionInhibitedMessage: "Object History Debugger: JavaScript Execution Inhibited (this exception is normal and expected)",
        loadingMessagePrefix: "Object History Debugger: ",
        onBeforePageLoad: function(callback) {
            this.executeScriptOnPage(`
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
                    console.log("%c " + String.fromCharCode(0x25BC) + " Most recent '" + this.propertyName + "' assignments:", "color: red; text-transform: uppercase; font-weight: bold; font-size: 10px")
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

                window.__ohdAssign = function(object, propertyName, value){
                        var propertyNameString = propertyName.toString()
                        var storagePropName = propertyNameString + "__history__";

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

                        if (object[storagePropName] === undefined){
                            Object.defineProperty(object, storagePropName, {
                                value: new HistoryEntry(propertyNameString),
                                enumerable: false,
                                writable: true
                            })
                        }

                        Error.stackTraceLimit = 100
                        var stack = Error().stack.split("\\n")
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
                            value: value,
                            stack
                        })

                        if (object[storagePropName].fullHistory.length > 20) {
                            object[storagePropName].fullHistory = object[storagePropName].fullHistory.slice(0, 20)
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
                `, () => {
                setTimeout(function() {
                    callback();
                }, 100)
            })
        }
    })
}
chrome.browserAction.onClicked.addListener(onBrowserActionClicked);
