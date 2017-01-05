var codeInstrumenter = new ChromeCodeInstrumenter({});


function onBrowserActionClicked(tab) {
    codeInstrumenter.toggleTabInstrumentation(tab.id, {
        babelPlugin: function(babel){
            return {}
        },
        jsExecutionInhibitedMessage: "Object History Debugger: JavaScript Execution Inhibited (this exception is normal and expected)",
        loadingMessagePrefix: "Object History Debugger: ",
        onBeforePageLoad: function(callback){
            this.executeScriptOnPage(`console.log("squee history debugger")`, () => {
                setTimeout(function(){
                    callback();
                },100)
            })
        }
    })
}
chrome.browserAction.onClicked.addListener(onBrowserActionClicked);
