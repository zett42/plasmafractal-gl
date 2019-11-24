/*
Option descriptor classes. Copyright (c) 2019 zett42.
https://github.com/zett42/plasmafractal-gl

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 
*/

import * as z42opt     from "./optionsDescriptor.js";
import * as z42optVal  from "./optionsDescriptorValues.js";
import * as z42optUtil from "./optionsUtils.js";
import * as z42easing  from "./easing.js";

//------------------------------------------------------------------------------------------------

export default class extends z42opt.Option {
	constructor( attrs ){
		super( attrs );

		// Create descriptors for palette item data.

		this.position = new z42optVal.FloatOpt({ 
			min: 0, max: 1, 
			maxDecimals: 3,
			defaultVal: 0
		});

		this.segment = new z42opt.Node( {}, {
			color: new z42optVal.ColorOpt({
				title: "Selected color",
				defaultVal: { r: 0, g: 0, b: 0, a: 1 }
			}),
			easeFun: new z42optVal.EnumOpt({
				title: "Selected ease function",
				values: this.$attrs.easeFunctions,
				defaultVal: this.$attrs.defaultEaseFunction
			}),
			isNoisy: new z42optVal.BoolOpt({
				title: "Add noise to lightness (HSL)",
				defaultVal: false,
			}),
			noise: new z42opt.Node( {}, {
				// NOTE: shortKey has to be only single letter for these options!

				frequency: new z42optVal.IntOpt({ 
					shortKey: "f",
					title: "Frequency",
					min: 1,
					max: 15,
					maxDecimals: 0,
					defaultVal: 2,
					depends: options => options.isNoisy
				}),
				octaves: new z42optVal.IntOpt({
					shortKey: "o",
					title: "Octaves",
					min: 1,
					max: 12,
					defaultVal: 4,
					depends: options => options.isNoisy
				}),
				gain: new z42optVal.FloatOpt({
					shortKey: "g",
					title: "Gain",
					min: 0.1,
					max: 1.0,
					maxDecimals: 2,
					defaultVal: 0.5,
					depends: options => options.isNoisy,
					enabled: options => options.noise.octaves >= 2,
				}),
				lacunarity: new z42optVal.IntOpt({
					shortKey: "l",
					title: "Lacunarity",
					min: 2,
					max: 10,
					defaultVal: 2,
					depends: options => options.isNoisy,
					enabled: options => options.noise.octaves >= 2,
				}),
				amplitude: new z42optVal.FloatOpt({
					shortKey: "a",
					title: "Amplitude",
					min: 0,
					max: 5,
					maxDecimals: 2,
					defaultVal: 0.5,
					depends: options => options.isNoisy
				}),
				seed: new z42optVal.FloatOpt({
					shortKey: "s",
					title: "Random seed",
					min: 0,
					max: 1.0,
					maxDecimals: 2,
					defaultVal: 0.5,
					depends: options => options.isNoisy
				}),
			}),
		});

		z42optUtil.validateUniqueShortKeys( this.segment.noise, "palette.noise" );
	}

	// Serialize to string.
	$serialize( value ) {
		let result = "";

		for( const item of value ){
			result.length === 0 || ( result += " " );

			result += this.position.$serialize( item.pos ) + "_";
			result += this.segment.color.$serialize( item.color ) + "_";
			result += this.segment.easeFun.$serialize( item.easeFun );

			if( item.isNoisy ){
				let noiseRes = "";

				for( const key in this.segment.noise ){
					noiseRes.length === 0 || ( noiseRes += "*" );

					const desc = this.segment.noise[ key ];
					noiseRes += desc.$attrs.shortKey;
					noiseRes += desc.$serialize( item.noise[ key ] );
				}

				result += "_" + noiseRes;
			}
		}

		return result;
	}

	// Deserialize from string.
	$deserialize( value ) {
		let result = [];

		const noiseShortKeyMap = {};
		z42optUtil.createShortKeyToPathMap( noiseShortKeyMap, this.segment.noise );

		for( const itemStr of value.split( " " ) ){
			const itemValues = itemStr.split( "_" );
			
			if( itemValues.length >= 2 ) {
				let item = {
					pos:     this.position.$deserialize( itemValues[ 0 ] ),
					color:   this.segment.color.$deserialize( itemValues[ 1 ] ),
					isNoisy: false,
				};
				
				if( itemValues.length >= 3 ){
					item.easeFun = this.segment.easeFun.$deserialize( itemValues[ 2 ] );
				}

				if( itemValues.length >= 4 ){
					item.isNoisy = true;
					item.noise = {};

					const noiseValues = itemValues[ 3 ].split( "*" );

					for( let i in noiseValues ){
						const nv = noiseValues[ i ];
						const shortKey = nv.substring( 0, 1 );
						const valueStr = nv.substring( 1 );
						const noiseKey = noiseShortKeyMap[ shortKey ];
						if( ! noiseKey ) {
							console.error( "Invalid shortKey for palette noise option:", shortKey );
							continue;
						}

						const value = this.segment.noise[ noiseKey ].$deserialize( valueStr );
						if( value !== null ){
							item.noise[ noiseKey ] = value;
						}
					}
				}
			
				result.push( item );
			}
		}

		return result;			
	}

	// Resolve ease function name to actual function.
	$resolveEaseFunction( functionName ) {
		return z42easing[ functionName ] || z42easing.linear;
	}

	// Return a cloned palette with ease function names resolved to actual functions.
	$resolvePaletteEaseFunctions( palette ) {
		return palette.map( item => {
			const res = _.cloneDeep( item );
			res.easeFun = this.$resolveEaseFunction( res.easeFun ) 
			return res;
		});
	}

	get $defaultComponent() { return "z42opt-palette"; }
}	
