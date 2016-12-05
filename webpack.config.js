var path=require('path');
var HtmlWebpackPlugin=require('html-webpack-plugin');
var webpack=require('webpack');

module.exports={
  entry:{
    "index":[
      './public/index.js'
    ]
    ,"vendor":["d3"]
  },
  'devtool':'inline-source-map',
  output:{
    path:path.join(__dirname,'dist'),
    filename:'[name]-[hash].js'
  },
  module:{
    loaders:[
      {
        test:/\.js$/,
        exclude:/node_modules/,
        loader:'babel',
        query:{
          presets:['es2015']
        }
      },
      {
        test:/\.css$/,
        loader:'style!raw'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  plugins:[
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({title:'index'}),
    new webpack.optimize.CommonsChunkPlugin("vendor","verdor-[hash].js")
  ]
};
