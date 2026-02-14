const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const isDevelopment = argv.mode === "development";

  // Load environment variables based on mode
  const envFile = isProduction ? '.env.production' : '.env.local';
  const envPath = path.resolve(__dirname, envFile);
  
  let envVars = {};
  try {
    const fs = require('fs');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      });
    }
  } catch (error) {
    console.warn('Could not load environment file:', error.message);
  }

  return {
    // Set mode based on command line argument
    mode: argv.mode || "development",
    
    // Entry points
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
      filename: isProduction ? "[name].[contenthash].js" : "[name].js",
      clean: true,
      publicPath: "/",
    },

    // Source maps for development
    devtool: isDevelopment ? "eval-cheap-module-source-map" : false,
    
    // Development server configuration
    devServer: {
      static: path.join(__dirname, "dist"),
      open: true,
      hot: true,
      port: 3000,
      historyApiFallback: true,
      compress: true,
    },

    // Optimization for better performance
    optimization: {
      splitChunks: {
        chunks: "all",
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: "firebase",
            chunks: "all",
            priority: 20,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
            maxSize: 200000,
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 5,
            maxSize: 100000,
          },
        },
      },
      usedExports: true,
      // Keep top-level side effects (like preloader removal) in imported modules
      // Don't globally disable sideEffects; rely on per-package hints instead
      sideEffects: true,
    },

    // Module rules
    module: {
      rules: [
        {
          test: /\.(scss|css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                implementation: require("sass-embedded"),
              },
            },
          ],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [["@babel/preset-env", { modules: false }]],
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
            filename: "assets/[name][ext]",
          },
        },
      ],
    },
    
    // Plugins
    plugins: [
      // Environment variables
      new webpack.DefinePlugin({
        "process.env": JSON.stringify(envVars),
      }),
      
      // CSS extraction
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),

      // HTML plugins
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
    
    // Resolve configuration
    resolve: {
      extensions: [".js", ".scss", ".css"],
    },
  };
};
