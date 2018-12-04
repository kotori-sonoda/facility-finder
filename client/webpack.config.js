module.exports = {
    mode: 'production',
    entry: './index.js',
    output: {
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /\.js?$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['react']
                }
            }
        }]
    }
};