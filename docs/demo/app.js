(function(){
    var txtMessage = document.querySelector("#txt-message")
    var btnToUppercase = document.querySelector("#btn-to-uppercase")
    var chkBold = document.querySelector("#chk-bold")
    var output = document.querySelector("#output")
    var messageObjectInfo = document.querySelector("#message-object-info")

    window.message = { text: "Hello World!", bold: false };

    txtMessage.addEventListener("keydown", function(){
        message.text = txtMessage.value;
        updateUI();
    })

    btnToUppercase.addEventListener("click", function(){
        message.text = message.text.toUpperCase();
        updateUI();
    })

    chkBold.addEventListener("change", function(){
        message.bold = !message.bold;
        updateUI()
    })

    function updateUI(){
        txtMessage.value = message.text

        output.textContent = message.text
        output.style.fontWeight = message.bold ? "bold" : "normal"

        var html = `
            <table border="1">
                <tr>

                </tr>
                <tr>
                    <td>Value</td>
                    <td>"${message.text}"</td>
                    <td>${message.bold}</td>
                </tr>
                <tr>
                    <td>History Length</td>
                    <td>${message.text__history__.fullHistory.length}</td>
                    <td>${message.bold__history__.fullHistory.length}</td>
                </tr>
                <tr>
                    <td>Last change location</td>
                    <td>${fileNameOnly(message.text__history__.fullHistory[0].stack[0])}</td>
                    <td>${fileNameOnly(message.bold__history__.fullHistory[0].stack[0])}</td>
                </tr>
                <tr>
                    <td>Last change location<br> (asynchronous, sourcemapped)</td>
                    <td id="last-change-text"></td>
                    <td id="last-change-bold"></td>
                </tr>
            </table>
        `

        messageObjectInfo.innerHTML = html;

        updateLastLocationSourcemapped(message.text__history__, "#last-change-text")
        updateLastLocationSourcemapped(message.bold__history__, "#last-change-bold")

        function updateLastLocationSourcemapped(history, selector){
            document.querySelector(selector).textContent = ""
            codePreprocessor.resolveFrame(history.fullHistory[0].stack[0], function(err, frame){
                // artificial delay to show it's asynchronous
                setTimeout(function(){
                    document.querySelector(selector).textContent = fileNameOnly(frame.fileName) + ":" + frame.lineNumber + ":" + frame.columnNumber
                }, 200)
            })
        }

        function fileNameOnly(fileName){
            var isDist = fileName.indexOf("/dist/") !== -1;
            var parts = fileName.split("/")

            var ret = isDist ? "dist/" : ""
            ret += parts[parts.length - 1]

            return ret
        }
    }

    updateUI()

    console.log("This is the global message object:", message)


})()
