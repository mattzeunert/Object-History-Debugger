module.exports = function(babel) {
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

                if (["+=", "-=", "/=", "*="].indexOf(path.node.operator) !== -1){
                    // I don't think this replacement is always going to be 100% equivalent
                    // to the +=/... operation, but it's close enough for now
                    // e.g. maybe there'd be props if path.node.left is sth like a.sth().aa would
                    // call sth twice
                    var operator = {"+=": "+", "-=": "-", "/=": "/", "*=": "*"}[path.node.operator]
                    var value = babel.types.binaryExpression(operator, path.node.left, path.node.right)
                    var replacement = babel.types.assignmentExpression("=", path.node.left, value)
                    path.replaceWith(replacement)
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
            UnaryExpression(path) {
                if (path.node.operator === "delete"){
                    var prop = path.node.argument.property
                    if (prop.type === "Identifier"){
                         prop = babel.types.stringLiteral(prop.name)
                    }
                    var call = babel.types.callExpression(
                    	babel.types.identifier("__ohdDeleteProperty"),
                        [
                            path.node.argument.object,
                            prop
                        ]
                    )
                    path.replaceWith(call)
                }
            }
        }
    }
}
