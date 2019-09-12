/*
Option descriptor classes. Copyright (c) 2019 zett42.
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
			return this.$attrs.defaultVal;
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
		return floatToStringCompact( value, this.$attrs.maxDecimals );
	}

	$deserialize( value ) {
		value = parseFloat( value );
		if( isNaN( value ) ) {
			this.$parseError( value );
			return this.$attrs.defaultVal;
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

	$serialize( value ) {
		value = String( value ).toLowerCase();

		for( const [ enumVal, enumInfo ] of Object.entries( this.$attrs.values ) ) {
			if( enumInfo.shortKey.toLowerCase() === value ){
				return enumInfo.shortKey;
			}
			if( enumVal.toLowerCase() === value ) {
				return enumInfo.shortKey;
			}
		}
		return null;
	}

	$deserialize( value ) {
		value = String( value ).toLowerCase();

		for( const [ enumVal, enumInfo ] of Object.entries( this.$attrs.values ) ) {
			if( enumInfo.shortKey.toLowerCase() === value ){
				return enumVal;
			}
			if( enumVal.toLowerCase() === value ) {
				return enumVal;
			}
		}
		this.$parseError( value );
		return this.$attrs.defaultVal;
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
			return this.$attrs.defaultVal;					
		}
		
		return color.toRgb(); // keep it pure data to simplify merging			
	}

	get $defaultComponent() { return "z42opt-color"; }
}	

//================================================================================================
// Utility functions

function clampOptional( value, min = null, max = null ) {
	if( min && value < min ) return min;
	if( max && value > max ) return max;
	return value;
}		

//------------------------------------------------------------------------------------------------

function floatToStringCompact( value, maxDecimals = null ) {
	if( maxDecimals != null ) {
		// convert to fixed, then remove trailing zeros by converting back to Number
		value = Number( value.toFixed( maxDecimals ) );
	}
	value = value.toString();
	// remove unneeded leading zero (e. g. "0.5" -> ".5" )
	if( value.charAt( 0 ) == "0" && value.charAt( 1 ) == "." )
		return value.substring( 1 );
	// remove unneeded leading zero after "-" (e. g. "-0.5" -> "-.5" )
	if( value.charAt( 0 ) == "-" && value.charAt( 1 ) == "0" && value.charAt( 2 ) == "." )
		return "-" + value.substring( 2 );
	return value;
}

//------------------------------------------------------------------------------------------------

export { Node, Option } from "./optionsDescriptor.module.js"

export { 
	clampOptional,
	floatToStringCompact,
	IntOpt,
	FloatOpt,
	BoolOpt,
	EnumOpt,
	ColorOpt,
}