/*
z42opt.Option descriptor classes. Copyright (c) 2019 zett42.
https://github.com/zett42/PlasmaFractal2

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

import * as z42opt from "./optionsDescriptor.module.js"

//------------------------------------------------------------------------------------------------

class IntOpt extends z42opt.Option {
	constructor( attrs ){
		super( attrs );
	}

	$serialize( value ) { 
		return Math.trunc( value ).toString(); 
	}

	$deserialize( value ) {
		value = parseInt( value, 10 );
		if( isNaN( value ) ) {
			this.$parseError( value );
			return null;
		}
		return clampOptional( Math.ceil( value ), this.$attrs.min, this.$attrs.max );
	}

	get $defaultComponent() { return "z42opt-range"; }
}

//------------------------------------------------------------------------------------------------

class FloatOpt extends z42opt.Option {
	constructor( attrs ){
		super( attrs );
	}

	$serialize( value ) { 
		if( typeof this.$attrs.maxFractionDigits !== "undefined" ) {
			return Number( value.toFixed( this.$attrs.maxFractionDigits ) );
		}
		return value;
	}

	$deserialize( value ) {
		value = parseFloat( value );
		if( isNaN( value ) ) {
			this.$parseError( value );
			return null;
		}
		return clampOptional( value, this.$attrs.min, this.$attrs.max ); 			
	}

	get $defaultComponent() { return "z42opt-range"; }
}

//------------------------------------------------------------------------------------------------

class BoolOpt extends z42opt.Option {
	constructor( attrs ){
		super( attrs );
	}

	$serialize( value ) {
		return value ? "1" : "0";			
	}

	$deserialize( value ) {
		const valueLCase = value.toString().toLowerCase();
		return ( valueLCase === "true" || valueLCase === "1" );
	}

	get $defaultComponent() { return "z42opt-check"; }
}

//------------------------------------------------------------------------------------------------

class EnumOpt extends z42opt.Option {
	constructor( attrs ){
		super( attrs );
	}

	$deserialize( value ) {
		for( const ev of this.$attrs.values ) {
			if( ev.toLowerCase() === String( value ).toLowerCase() ) {
				return ev;
			}
		}
		this.$parseError( value );
		return null;
	}

	get $defaultComponent() { return "z42opt-select"; }
}

//------------------------------------------------------------------------------------------------

class ColorOpt extends z42opt.Option {
	constructor( attrs ){
		super( attrs );
	}

	$serialize( value ) {
		return tinycolor( value ).toHex();
	}

	$deserialize( value ) {
		const color = tinycolor( value );
		if( ! color.isValid() )	{
			this.$parseError( value );
			return null;					
		}
		
		return color.toRgb(); // keep it pure data to simplify merging			
	}

	get $defaultComponent() { return "z42opt-color"; }
}	

//------------------------------------------------------------------------------------------------

function clampOptional( value, min = null, max = null ) {
	if( min && value < min ) return min;
	if( max && value > max ) return max;
	return value;
}		

//------------------------------------------------------------------------------------------------

export { Node, Option } from "./optionsDescriptor.module.js"

export { 
	IntOpt,
	FloatOpt,
	BoolOpt,
	EnumOpt,
	ColorOpt,
}