var WebpackShellPlugin = require("webpack-shell-plugin")

function getBaseConfig(){
    return {
        entry: "./ohd-with-babel.js",
        output: {
            path: "./dist/",
            filename: "ohd.js",
            library: "objectHistoryDebugger",
            libraryTarget: "umd"
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: "babel"
                }
            ]
        },
        plugins: [
            new WebpackShellPlugin({
                onBuildExit: [

                ]
            })
        ]
    }
}

var npmPluginConfig = getBaseConfig();
npmPluginConfig.externals = {
    "babel-core": "commonjs babel-core",
    "babylon": "commonjs babylon"
}
npmPluginConfig.node = {global: false}

var demoConfig = getBaseConfig();
demoConfig.node = {
    fs: 'empty',
    module: 'empty',
    net: 'empty',
}
demoConfig.module.loaders.push({
    test: /\.json$/,
    loader: "json"
})
demoConfig.output.path = "./docs/demo/dist"
// The demo doesn't use `eval` or `new Function`, so we don't
// need to load Babel, which would make our file 2MB+
demoConfig.externals = {
    "babel-core": "babelNotNeeded",
    "babylon": "babelNotNeeded"
}

module.exports = [npmPluginConfig, demoConfig];
