"use strict";

(function () {
    var txtMessage = document.querySelector("#txt-message");
    var btnToUppercase = document.querySelector("#btn-to-uppercase");
    var chkBold = document.querySelector("#chk-bold");
    var output = document.querySelector("#output");
    var messageObjectInfo = document.querySelector("#message-object-info");

    __ohdAssign(window, "message", __ohdMakeObject([["ObjectProperty", "text", "Hello World!"], ["ObjectProperty", "bold", false]]));

    txtMessage.addEventListener("keyup", function () {
        __ohdAssign(message, "text", txtMessage.value);
        updateUI();
    });

    btnToUppercase.addEventListener("click", function () {
        __ohdAssign(message, "text", message.text.toUpperCase());
        updateUI();
    });

    chkBold.addEventListener("change", function () {
        __ohdAssign(message, "bold", !message.bold);
        updateUI();
    });

    function updateUI() {
        __ohdAssign(txtMessage, "value", message.text);

        __ohdAssign(output, "textContent", message.text);
        __ohdAssign(output.style, "fontWeight", message.bold ? "bold" : "normal");

        var html = "\n            <table>\n                <tr>\n                    <th>Inspect window.message!</th>\n                    <th>message.text</th>\n                    <th>message.bold</th>\n                </tr>\n                <tr>\n                    <td>Value</td>\n                    <td>\"" + message.text + "\"</td>\n                    <td>" + message.bold + "</td>\n                </tr>\n                <tr>\n                    <td>History Length</td>\n                    <td>" + message.text__history__.fullHistory.length + "</td>\n                    <td>" + message.bold__history__.fullHistory.length + "</td>\n                </tr>\n                <tr>\n                    <td>Last change location</td>\n                    <td>" + fileNameOnly(message.text__history__.fullHistory[0].stack[0]) + "</td>\n                    <td>" + fileNameOnly(message.bold__history__.fullHistory[0].stack[0]) + "</td>\n                </tr>\n                <tr>\n                    <td>Last change location<br> (asynchronous, sourcemapped)</td>\n                    <td id=\"last-change-text\"></td>\n                    <td id=\"last-change-bold\"></td>\n                </tr>\n                <tr>\n                    <td>See console for results</td>\n                    <td><button onClick=\"message.text__history__.prettyPrintSynchronously()\">Call .prettyPrintSynchronously</button></td>\n                    <td><button onClick=\"message.bold__history__.prettyPrintSynchronously()\">Call .prettyPrintSynchronously</button></td>\n                </tr>\n                <tr>\n                    <td>See console for results</td>\n                    <td onClick=\"message.bold__history__.prettyPrint()\"><button>Call .prettyPrint</button></td>\n                    <td onClick=\"message.bold__history__.prettyPrint()\"><button>Call .prettyPrint</button></td>\n                </tr>\n            </table>\n\n        ";

        __ohdAssign(messageObjectInfo, "innerHTML", html);

        updateLastLocationSourcemapped(message.text__history__, "#last-change-text");
        updateLastLocationSourcemapped(message.bold__history__, "#last-change-bold");

        function updateLastLocationSourcemapped(history, selector) {
            __ohdAssign(document.querySelector(selector), "textContent", "");
            codePreprocessor.resolveFrame(history.fullHistory[0].stack[0], function (err, frame) {
                // artificial delay to show it's asynchronous
                setTimeout(function () {
                    __ohdAssign(document.querySelector(selector), "textContent", fileNameOnly(frame.fileName) + ":" + frame.lineNumber + ":" + frame.columnNumber);
                }, 200);
            });
        }

        function fileNameOnly(fileName) {
            var isDist = fileName.indexOf("/dist/") !== -1;
            var parts = fileName.split("/");

            var ret = isDist ? "dist/" : "";
            ret = ret + parts[parts.length - 1];

            return ret;
        }
    }

    updateUI();

    console.log("This is the global message object:", message);
})();
//# sourceMappingURL=app.js.map