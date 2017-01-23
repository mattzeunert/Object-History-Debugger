var WebpackShellPlugin = require("webpack-shell-plugin")

module.exports = {
    entry: "./test.js",
    output: {
        path: "./dist/",
        filename: "test.js"
    },
    devtool: "inline-sourcemap",
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel"
            }
        ]
    }
};
