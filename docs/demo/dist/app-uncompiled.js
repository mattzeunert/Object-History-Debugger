"use strict";

(function () {
    var txtMessage = document.querySelector("#txt-message");
    var btnToUppercase = document.querySelector("#btn-to-uppercase");
    var chkBold = document.querySelector("#chk-bold");
    var output = document.querySelector("#output");
    var messageObjectInfo = document.querySelector("#message-object-info");

    __ohdAssign(window, "message", __ohdMakeObject([["ObjectProperty", "text", "Hello World!"], ["ObjectProperty", "bold", false]]));

    txtMessage.addEventListener("keydown", function () {
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

        var html = "\n            <table border=\"1\">\n                <tr>\n\n                </tr>\n                <tr>\n                    <td>Value</td>\n                    <td>\"" + message.text + "\"</td>\n                    <td>" + message.bold + "</td>\n                </tr>\n                <tr>\n                    <td>History Length</td>\n                    <td>\"" + message.text__history__.fullHistory.length + "\"</td>\n                    <td>" + message.bold__history__.fullHistory.length + "</td>\n                </tr>\n            </table>\n        ";

        __ohdAssign(messageObjectInfo, "innerHTML", html);
    }

    updateUI();

    console.log("This is the global message object:", message);
})();