var codeInstrumenter = new ChromeCodeInstrumenter({});

var ohdJS = "not loaded yet"
fetch("ohd.js").then(r => r.text()).then(js => ohdJS = js)

function onBrowserActionClicked(tab) {
    codeInstrumenter.toggleTabInstrumentation(tab.id, {
        babelPlugin: window.babelPlugin,
        jsExecutionInhibitedMessage: "Object History Debugger: JavaScript Execution Inhibited (this exception is normal and expected)",
        loadingMessagePrefix: "Object History Debugger: ",
        onBeforePageLoad: function(callback) {
            this.executeScriptOnPage(ohdJS, () => {
                setTimeout(function() {
                    callback();
                }, 100)
            })
        }
    })
}
chrome.browserAction.onClicked.addListener(onBrowserActionClicked);
