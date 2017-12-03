const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
});

module.exports = {
    entry: "./src/app.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "build"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ["env", "react"],
                },
            },
            {
                test: /\.sass$/,
                use: extractSass.extract({
                    use: [ "css-loader", "sass-loader" ],
                }),
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(["build"]),
        new HtmlWebpackPlugin({
            template: "src/index.html"
        }),
        extractSass,
    ],
};
