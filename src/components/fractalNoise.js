/*
2D fractal noise generation. Copyright (c) 2019 zett42.
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

import z42noiseGen from './noiseGen.js';
import MersenneTwister from 'mersennetwister';

//----------------------------------------------------------------------------------------------------------------
// Class to generate 2D fractal noise.
	
export default class {
	constructor( octaves, seed = Math.random() ) {
		this._noiseGenes = [];
		this._seed = Math.trunc( seed * 0xFFFFFFFF );
		this.octaves = octaves;
	}

	//----------------------------------------------------------------------------------------------------------------
	// Get / set number of octaves for fractal noise.

	set octaves( value ) {
		value = Math.trunc( value );
		if( this._noiseGenes.length === value )
			return;

		this._noiseGenes.length = value;

		const rnd = new MersenneTwister( this._seed );

		for( let i = 0; i < value; ++i ) {
			const octaveSeed = rnd.random();
			
			let gen = this._noiseGenes[ i ];
			if( gen ) {
				gen.seed = octaveSeed;
			}
			else {
				gen = this._noiseGenes[ i ] = new z42noiseGen( octaveSeed );
			}

		}
	}

	get octaves() { return this._noiseGenes.length; }

	//----------------------------------------------------------------------------------------------------------------
	/// Get fractal noise value at given coordinates. Result will be in range of -amplitude to amplitude (approx.)
	
	noise( x, y, frequency = 1.0, gain = 0.5, lacunarity = 2.0, amplitude = 1.0 ) {
		let res  = 0;
		let f    = frequency;
		let a    = amplitude;

		for( let i = 0; i < this._noiseGenes.length; i++ ) {
			// All noise functions return values in the range of -1 to 1.
			let n = this._noiseGenes[ i ].perlin2( x * f, y * f );
			res += n * a;			
			a *= gain;
			f *= lacunarity;
		}
		
		return res;  
	}	

	//----------------------------------------------------------------------------------------------------------------
}