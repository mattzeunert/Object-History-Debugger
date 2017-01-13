module.exports = {
    entry: "./ohd-with-babel.js",
    output: {
        path: "./",
        filename: "index.js",
        library: "objectHistoryDebugger",
        libraryTarget: "commonjs2"
    },
    devtool: "eval",
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
