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
                function HistoryEntry(){
                    this.lastAssignment = null;
                    this.fullHistory = [];
                }

                HistoryEntry.prototype.prettyPrint = function(){

                }
                HistoryEntry.prototype.prettyPrintSortOf = function(){
                    var hist = this;

                    console.log("%c " + String.fromCharCode(0x25BC) + " Most recent assignment", "color: red; text-transform: uppercase; font-weight: bold; font-size: 10px")
                    hist.fullHistory.forEach((assignment, i) => {
                        console.log("[" + i + "] Set to ", assignment.value, assignment.stack[0])
                        console.groupCollapsed("%c MORE", "font-weight: bold; font-size: 7px;color: #777")
                        assignment.stack.forEach(function(frame){
                            console.log(frame)
                        })
                        console.groupEnd()
                    })
                    console.log("%c " + String.fromCharCode(0x25B2) + " First assignment", "color: red; text-transform: uppercase; font-weight: bold; font-size: 10px")
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
                                value: new HistoryEntry(),
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
                            return true;
                        })

                        object[storagePropName].lastAssignment = stack[0]
                        object[storagePropName].fullHistory.unshift({
                            value: value,
                            stack
                        })

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
