module.exports = {
    entry: "./ohd-with-babel.js",
    output: {
        path: "./",
        filename: "index.js"
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
    },
    node: {
        global: false
    }
};
