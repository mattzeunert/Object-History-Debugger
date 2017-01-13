# Object History Debugger

See where an object's property values were assigned, plus a history of past values.

![](https://cloud.githubusercontent.com/assets/1303660/21923127/33283af2-d96a-11e6-96e0-df9cbb42550f.png)

![](https://cloud.githubusercontent.com/assets/1303660/21923131/377ca912-d96a-11e6-8895-d92e9b227e1d.png)

## How to use

You can either inspect the property's history in a debugger, call `prettyPrint` on the history property.

For example, if your property name is `sth` you would call `obj.sth.sth__history__.prettyPrint()`.

Pretty print shows you the original source code you wrote. Because it's asynchronous it won't log the history right away if you're paused in the debugger.

To see the history without having to resume execution call `prettyPrintSynchronously`.

### Chrome extension: easy setup, but flaky

[Install the Chrome extension](https://chrome.google.com/webstore/detail/object-history-debugger/hmnmphiibikkcahffmpkadbibhokagho/related) then click the icon next to the URL bar to reload the current page with object tracking enabled.

The Chrome extension is quite hacky and some pages will break when Object History Debugger is activated.

TODO: link to an example that can be easily inspected with the chrome extension

### Add a plugin to your babel build

1. `npm install object-history-debugger`
2. Add `object-history-debugger/babel-plugin` to your Babel plugins, e.g. in .babelrc
3. Put `import "object-history-debugger"` before any of your own JS code.
4. Build your project and load it as usual.

#### Tracking only specific objects to save memory

TODO
