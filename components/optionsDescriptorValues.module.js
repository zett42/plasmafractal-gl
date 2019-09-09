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
		if( typeof this.$attrs.maxFractionDigits !== "undefined" ) {
			// convert to fixed, then remove trailing zeros
			value = Number( value.toFixed( this.$attrs.maxFractionDigits ) );
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

	get $values(){
		return Object.keys( this.$attrs.values );
	}

	$serialize( value ) {
		value = String( value ).toLowerCase();

		for( const [ enumVal, shortKey ] of Object.entries( this.$attrs.values ) ) {
			if( shortKey.toLowerCase() === value ){
				return shortKey;
			}
			if( enumVal.toLowerCase() === value ) {
				return shortKey;
			}
		}
		return null;
	}

	$deserialize( value ) {
		value = String( value ).toLowerCase();

		for( const [ enumVal, shortKey ] of Object.entries( this.$attrs.values ) ) {
			if( shortKey.toLowerCase() === value ){
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

//------------------------------------------------------------------------------------------------

class PaletteOpt extends z42opt.Option {
	constructor( attrs ){
		super( attrs );

		this.$attrs.posDesc = new FloatOpt({ 
			min: 0, max: 1, maxFractionDigits: 2,
			defaultVal: 0
		});
		this.$attrs.colorDesc = new ColorOpt({
			defaultVal: { r: 0, g: 0, b: 0 }
		});
		this.$attrs.easeDesc  = new EnumOpt({	
			values: this.$attrs.easeFunctions,
			defaultVal: this.$attrs.defaultEaseFunction
		});
	}

	$serialize( value ) {
		let result = "";

		for( const item of value ){
			if( result.length > 0 )
				result += " ";
			result += this.$attrs.posDesc.$serialize( item.pos ) + "_";
			result += this.$attrs.colorDesc.$serialize( item.color ) + "_";
			result += this.$attrs.easeDesc.$serialize( item.easeFunction );
		}

		return result;
	}

	$deserialize( value ) {
		let result = [];

		for( const itemStr of value.split( " " ) ){
			let item = {};
			const itemValues = itemStr.split( "_" );
			if( itemValues.length < 2 )
				continue;
			item.pos = Number( itemValues[ 0 ] );
			item.color = this.$attrs.colorDesc.$deserialize( itemValues[ 1 ] );
			if( itemValues.length >= 3 )
				item.easeFunction = this.$attrs.easeDesc.$deserialize( itemValues[ 2 ] );
			else
				item.easeFunction = this.$attrs.defaultEaseFunction;
			
			result.push( item );
		}

		return result;			
	}

	get $defaultComponent() { return "z42opt-palette"; }
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
	PaletteOpt,
}