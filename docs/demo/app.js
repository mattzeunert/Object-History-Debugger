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
                    <td>"${message.text__history__.fullHistory.length}"</td>
                    <td>${message.bold__history__.fullHistory.length}</td>
                </tr>
            </table>
        `

        messageObjectInfo.innerHTML = html;
    }

    updateUI()

    console.log("This is the global message object:", message)

})()
