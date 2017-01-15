(function(){
    var txtMessage = document.querySelector("#txt-message")
    var btnToUppercase = document.querySelector("#btn-to-uppercase")
    var chkBold = document.querySelector("#chk-bold")
    var output = document.querySelector("#output")

    window.message = { text: "Open the console", bold: false };

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
    }

    updateUI()

    console.log("This is the global message object:", message)
})()
