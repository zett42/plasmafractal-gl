const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

module.exports = {
	publicPath: process.env.NODE_ENV === 'production'
		? '/plasmafractal-gl/'   // for GitHub pages
		: '/',	

	// Override the default of "dist" for testing build locally while 'publicPath' is overriden.
	outputDir: './plasmafractal-gl',
	
	configureWebpack: {
		plugins: [
			// https://github.com/jantimon/favicons-webpack-plugin
			new FaviconsWebpackPlugin({
			    logo: './src/assets/logo.png', // svg works too!
				mode: 'webapp',   // optional can be 'webapp' or 'light' - 'webapp' by default
				devMode: 'light', // optional can be 'webapp' or 'light' - 'light' by default 
				favicons: {
					background: '#000',
					icons: {
						favicons: true,
						android: true,
						appleIcon: true,
						appleStartup: false,
						coast: false,
						firefox: false,
						windows: false,
						yandex: false,
					}
				}
			})
		]
	}
}