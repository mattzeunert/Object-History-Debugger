var WebpackShellPlugin = require("webpack-shell-plugin")

function getBaseConfig(){
    return {
        entry: "./src/ohd-with-babel.js",
        output: {
            path: "./dist/",
            filename: "ohd.js",
            library: "objectHistoryDebugger",
            libraryTarget: "umd"
        },
        // We don't want to process our own code with the babel plugin,
        // so include it as a string
        devtool: "eval",
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: "babel"
                },
                {
                    test: /\.json$/,
                    loader: "json"
                }
            ]
        },
        node: {
            fs: 'empty',
            module: 'empty',
            net: 'empty',
        },
        plugins: []
    }
}

var npmPluginConfig = getBaseConfig();
npmPluginConfig.plugins.push(new WebpackShellPlugin({
    onBuildExit: [
        "node ./src/scripts/make-global-object-work-in-strict-mode.js"
    ]
}))

var demoConfig = getBaseConfig();
demoConfig.output.path = "./docs/demo/dist"
// The demo doesn't use `eval` or `new Function`, so we don't
// need to load Babel, which would make our file 2MB+
demoConfig.externals = {
    "babel-core": "babelNotNeeded",
    "babylon": "babelNotNeeded"
}

module.exports = [npmPluginConfig, demoConfig];
