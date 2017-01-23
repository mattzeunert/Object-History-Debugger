"use strict";

(function () {
    var txtMessage = document.querySelector("#txt-message");
    var btnToUppercase = document.querySelector("#btn-to-uppercase");
    var chkBold = document.querySelector("#chk-bold");
    var output = document.querySelector("#output");
    var messageObjectInfo = document.querySelector("#message-object-info");

    var isMobile = navigator.userAgent.match(/iPhone|iPad|IEMobile|Android/);
    var isChrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
    var isFirefox = /firefox/.test(navigator.userAgent.toLowerCase());
    var isDesktopChrome = !isMobile && isChrome;

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

        var html = "\n            <table>\n                <tr>\n                    <th style=\"width: 230px\">Inspect window.message!</th>\n                    <th style=\"width: 397px\">message.text</th>\n                    <th style=\"width: 397px\">message.bold</th>\n                </tr>\n                <tr>\n                    <td>Value</td>\n                    <td>\"" + message.text + "\"</td>\n                    <td>" + message.bold + "</td>\n                </tr>\n                <tr>\n                    <td>History Length</td>\n                    <td>" + message.text__history__.fullHistory.length + "</td>\n                    <td>" + message.bold__history__.fullHistory.length + "</td>\n                </tr>\n                <tr>\n                    <td>Last change at</td>\n                    <td>" + fileNameOnly(message.text__history__.fullHistory[0].stack[0]) + "</td>\n                    <td>" + fileNameOnly(message.bold__history__.fullHistory[0].stack[0]) + "</td>\n                </tr>\n                <tr>\n                    <td>Last change<br> (sourcemapped)</td>\n                    <td id=\"last-change-text\"></td>\n                    <td id=\"last-change-bold\"></td>\n                </tr>\n                <tr>\n                    <td>See console for results</td>\n                    <td><button onClick=\"message.text__history__.prettyPrintSynchronously()\">Call .prettyPrintSynchronously</button></td>\n                    <td><button onClick=\"message.bold__history__.prettyPrintSynchronously()\">Call .prettyPrintSynchronously</button></td>\n                </tr>\n                <tr>\n                    <td>See console for results</td>\n                    <td onClick=\"message.bold__history__.prettyPrint()\"><button>Call .prettyPrint</button></td>\n                    <td onClick=\"message.bold__history__.prettyPrint()\"><button>Call .prettyPrint</button></td>\n                </tr>\n            </table>\n\n        ";

        __ohdAssign(messageObjectInfo, "innerHTML", html);

        updateLastLocationSourcemapped(message.text__history__, "#last-change-text");
        updateLastLocationSourcemapped(message.bold__history__, "#last-change-bold");

        function updateLastLocationSourcemapped(history, selector) {
            var outputEl = document.querySelector(selector);
            if (isMobile || !isChrome && !isFirefox) {
                __ohdAssign(outputEl, "innerHTML", "Currently Desktop Firefox/Chrome-only");
                return;
            }

            __ohdAssign(document.querySelector(selector), "textContent", "");
            codePreprocessor.resolveFrame(history.fullHistory[0].stack[0], function (err, frame) {
                // artificial delay to show it's asynchronous
                setTimeout(function () {
                    var location = fileNameOnly(frame.fileName) + ":" + frame.lineNumber + ":" + frame.columnNumber;
                    var locationEl = document.createElement("div");
                    __ohdAssign(locationEl, "textContent", location);
                    var codeEl = document.createElement("code");
                    __ohdAssign(codeEl, "textContent", frame.line);

                    __ohdAssign(outputEl, "innerHTML", "");
                    outputEl.appendChild(locationEl);
                    outputEl.appendChild(codeEl);
                }, 200);
            });
        }

        function fileNameOnly(fileName) {
            var isDist = fileName.indexOf("/dist/") !== -1;
            var parts = fileName.split("/");

            var ret = isDist ? "dist/" : "";
            ret = ret + parts[parts.length - 1];
            ret.replace(")", ""); // from end of a call frame string

            return ret;
        }
    }

    updateUI();

    console.log("This is the global message object:", message);
})();
//# sourceMappingURL=app.js.map