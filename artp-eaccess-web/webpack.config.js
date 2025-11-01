const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const path = require("path");
const shareAll = mf.shareAll;

// const dotenv = require('dotenv');
// dotenv.config();

// // Détecter l'environnement à partir d'une variable système (ex: NODE_ENV)
// const envFile = `.env.${process.env.ENV || 'devs'}`;

// // Charger les variables d'environnement depuis le fichier correspondant
// dotenv.config({ path: path.resolve(__dirname, envFile) });

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  path.join(__dirname, 'tsconfig.json'),
  [/* mapped paths to share */]
);

module.exports = {
  module: {
   
  },
  output: {
    uniqueName: "shell",
    publicPath: "auto",
    scriptType: "text/javascript",
    
  },
  optimization: {
    runtimeChunk: false
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    }
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        app: "app@https://localhost:4200/remoteEntry.js",
      },
      shared: {
        ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
        "@angular/material": { singleton: true, strictVersion: true },
        "@angular/material/core": { singleton: true, strictVersion: true },
        "@angular/material/form-field": { singleton: true, strictVersion: true },
        "@angular/material/input": { singleton: true, strictVersion: true },
        "@angular/material/select": { singleton: true, strictVersion: true },
        "ng2-nouislider": { singleton: true, strictVersion: true },

      }
    }),
 
    sharedMappings.getPlugin()
  ],
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  }
};
