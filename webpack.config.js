var WebpackShellPlugin = require("webpack-shell-plugin")

module.exports = {
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
                `cp dist/ohd.js docs/demo/dist/ohd.js`,
            ]
        })
    ]
};


module.exports.externals = {
    "babel-core": "commonjs babel-core",
    "babylon": "commonjs babylon"
}
module.exports.node.global = false;
