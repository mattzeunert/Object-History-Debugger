module.exports = {
    entry: "./ohd-with-babel.js",
    output: {
        path: "./dist",
        filename: "ohd.js"
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
    node: {
        global: false
    }
};
