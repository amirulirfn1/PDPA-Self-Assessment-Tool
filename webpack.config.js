const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  //basics
  mode: "development",
  entry: {
    main: path.resolve(__dirname, "src/js/main.js"),
    index: path.resolve(__dirname, "src/js/index.js"),
    signin: path.resolve(__dirname, "src/js/signin.js"),
    signup: path.resolve(__dirname, "src/js/signup.js"),
    loginadmin: path.resolve(__dirname, "src/js/loginadmin.js"),
    adminmain: path.resolve(__dirname, "src/js/adminmain.js"),
    home: path.resolve(__dirname, "src/js/home.js"),
    feedback: path.resolve(__dirname, "src/js/feedback.js"),
    resetpasswordadmin: path.resolve(__dirname, "src/js/resetpasswordadmin.js"),
    forgotpassword: path.resolve(__dirname, "src/js/forgotpassword.js"),
    assessment: path.resolve(__dirname, "src/js/assessment.js"),
    assessmentresult: path.resolve(__dirname, "src/js/assessmentresult.js"),
    adminprofile: path.resolve(__dirname, "src/js/adminprofile.js"),
    profile: path.resolve(__dirname, "src/js/profile.js"),
    pdpaguidelines: path.resolve(__dirname, "src/js/pdpa-guidelines.js"),
    viewfeedback: path.resolve(__dirname, "src/js/view-feedback.js"),
    userslist: path.resolve(__dirname, "src/js/userslist.js"),
    editassessment: path.resolve(__dirname, "src/js/edit-assessment.js"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    //assetModuleFilename: "img/[name].[ext]",
    clean: true,
  },

  devtool: "inline-source-map",
  devServer: {
    static: path.join(__dirname, "dist"),
    //contentBase: path.resolve(__dirname, "dist"),
    //port: 5001,
    open: true,
    hot: true,
  },

  //loaders
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.html$/,
        use: ["html-loader"],
      },
      {
        test: /\.(svg|ico|png|webp|jpg|jpeg|gif|woff2?)$/,
        type: "asset/resource",
        generator: {
          filename: "img/[name][ext]",
        },
        parser: {
          dataUrlCondition: {
            maxSize: 8192,
          },
        },
      },
    ],
  },
  //plugins
  plugins: [
    //do not touch
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),

    /*ADD NEW HTMLWEBPACKPLUGIN WHEN NEW HTML ADDED (COPY PASTE)
            new HtmlWebpackPlugin({
            filename: "index.html",
            template: path.resolve(__dirname, "src/html/index.html"),
            chunks: ["index"], //CHUNK IS JAVASCRIPT USED (LINE 8 TO ADD MORE JS) !!! FOLLOW THE HTML NAME
        }),
        */

    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "src/html/index.html"),
      chunks: ["index"],
    }),
    new HtmlWebpackPlugin({
      filename: "signin.html",
      template: path.resolve(__dirname, "src/html/signin.html"),
      chunks: ["signin"],
    }),
    new HtmlWebpackPlugin({
      filename: "signup.html",
      template: path.resolve(__dirname, "src/html/signup.html"),
      chunks: ["signup"],
    }),
    new HtmlWebpackPlugin({
      filename: "loginadmin.html",
      template: path.resolve(__dirname, "src/html/loginadmin.html"),
      chunks: ["loginadmin"],
    }),
    new HtmlWebpackPlugin({
      filename: "home.html",
      template: path.resolve(__dirname, "src/html/home.html"),
      chunks: ["home"],
    }),
    new HtmlWebpackPlugin({
      filename: "feedback.html",
      template: path.resolve(__dirname, "src/html/feedback.html"),
      chunks: ["feedback"],
    }),
    new HtmlWebpackPlugin({
      filename: "adminmain.html",
      template: path.resolve(__dirname, "src/html/adminmain.html"),
      chunks: ["adminmain"],
    }),
    new HtmlWebpackPlugin({
      filename: "resetpasswordadmin.html",
      template: path.resolve(__dirname, "src/html/resetpasswordadmin.html"),
      chunks: ["resetpasswordadmin"],
    }),
    new HtmlWebpackPlugin({
      filename: "forgotpassword.html",
      template: path.resolve(__dirname, "src/html/forgotpassword.html"),
      chunks: ["forgotpassword"],
    }),

    new HtmlWebpackPlugin({
      filename: "assessment.html",
      template: path.resolve(__dirname, "src/html/assessment.html"),
      chunks: ["assessment"],
    }),
    new HtmlWebpackPlugin({
      filename: "assessmentresult.html",
      template: path.resolve(__dirname, "src/html/assessmentresult.html"),
      chunks: ["assessmentresult"],
    }),
    new HtmlWebpackPlugin({
      filename: "adminprofile.html",
      template: path.resolve(__dirname, "src/html/adminprofile.html"),
      chunks: ["adminprofile"],
    }),
    new HtmlWebpackPlugin({
      filename: "profile.html",
      template: path.resolve(__dirname, "src/html/profile.html"),
      chunks: ["profile"],
    }),
    new HtmlWebpackPlugin({
      filename: "pdpa-guidelines.html",
      template: path.resolve(__dirname, "src/html/pdpa-guidelines.html"),
      chunks: ["pdpaguidelines"],
    }),
    new HtmlWebpackPlugin({
      filename: "view-feedback.html",
      template: path.resolve(__dirname, "src/html/view-feedback.html"),
      chunks: ["viewfeedback"],
    }),
    new HtmlWebpackPlugin({
      filename: "userslist.html",
      template: path.resolve(__dirname, "src/html/userslist.html"),
      chunks: ["userslist"],
    }),
    new HtmlWebpackPlugin({
      filename: "edit-assessment.html",
      template: path.resolve(__dirname, "src/html/edit-assessment.html"),
      chunks: ["editassessment"],
    }),
  ],
};
