const path = require("path");

module.exports = {
  entry: "./background/index.ts",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.background.json",
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "background.js",
    path: path.resolve(__dirname, "build"),
  },
};