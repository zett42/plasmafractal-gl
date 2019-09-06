/*
Option utilities. Copyright (c) 2019 zett42.
https://github.com/zett42/PlasmaFractal

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
(function(global){
	'use strict';
	
	var module = global.z42opt = {};

	//================================================================================================
	// Exported classes
	//================================================================================================

	// Class defines a node of attributes and child nodes similar to XML.

	class Node {
		constructor( attrs, nodes ) {
		
			// Define $attrs as non-enumerable property.
			Object.defineProperty( this, "$attrs", {
				enumerable: false,
				configurable: false,
				writable: true,
				value: attrs
			});	
		
			// Insert child nodes.
			Object.assign( this, nodes );			
		}
	}
	module.Node = Node;

	//------------------------------------------------------------------------------------------------
	// Class that describes a single option. The option could be a primitive value or an object.

	class Option extends Node {
		constructor( attrs ){
			super( attrs );
		}
		
		// Serialize to string.
		$serialize( value ) { return value.toString(); }
	
		// Deserialize from string.
		$deserialize( value ) { return value; }

		// Output parse error
		$parseError( value ) {
			console.error( "Invalid option value:", value, ", descriptor:", this );
		}

		// Return name of default component that will be used to render this item if $attrs.component is not defined.
		// To be overridden by derived classes.
		get $defaultComponent() { return null; }

		// Actual component to use.
		get $component() { return this.$attrs.component || this.$defaultComponent; }
	}
	module.Option = Option;

	//------------------------------------------------------------------------------------------------

	class IntOpt extends Option {
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
	module.IntOpt = IntOpt;

	//------------------------------------------------------------------------------------------------

	class FloatOpt extends Option {
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
	module.FloatOpt = FloatOpt;

	//------------------------------------------------------------------------------------------------

	class BoolOpt extends Option {
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
	module.BoolOpt = BoolOpt;

	//------------------------------------------------------------------------------------------------

	class EnumOpt extends Option {
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
	module.EnumOpt = EnumOpt;

	//------------------------------------------------------------------------------------------------

	class ColorOpt extends Option {
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
	module.ColorOpt = ColorOpt;

	//================================================================================================
	// Exported functions
	//================================================================================================
	
	// Get the default option values from optionsDescriptor and merge them with the given URL params.

	module.mergeDefaultsWithUrlParams = function( optionsDescriptor, urlParams )
	{
		let result = {};
		z42opt.setDefaultOptions( result, optionsDescriptor );

		console.log( "Default options:", JSON.parse( JSON.stringify( result ) ) );

		// Deserialize and validate URL parameters.	
		const par = z42opt.optionsFromUrlParams( urlParams, optionsDescriptor );
		if( par )
		{
			console.log( "URL params:", JSON.parse( JSON.stringify( par ) ) );

			z42opt.mergeObjectData( result, par );

			console.log( "Merged options:", JSON.parse( JSON.stringify( result ) ) );
		}

		return result;
	}	

	//------------------------------------------------------------------------------------------------
	// Set values in options object to the default values obtained from descriptor.

	module.setDefaultOptions = function( result, descriptor, resultPath = null ) {
		if( ! ( descriptor instanceof Node ) )
			throw new Error( "Invalid argument: descriptor must be instance of z42opt.Node" );

		for( const [ key, childDescriptor ] of Object.entries( descriptor ) ) {
			const childPath = module.joinPath( resultPath, key );

			if( childDescriptor instanceof Option ){
				let defaultVal = childDescriptor.$attrs.defaultVal; 
				if( typeof defaultVal === "undefined" ){
					console.error( "Missing attribute defaultVal for option:", childPath );
					defaultVal = null;
				}
				// Set default value by path.
				module.setMemberByPath( result, childPath, defaultVal );
			}
			else {
				// Recurse into child descriptor.
				module.setDefaultOptions( result, childDescriptor, childPath );
			}
		}
	}
	
	//------------------------------------------------------------------------------------------------

	module.optionsFromUrlParams = function( urlParams, descriptor ) {
		if( ! ( descriptor instanceof Node ) )
			throw new Error( "Invalid argument: descriptor must be instance of z42opt.Node" );

		let result = {};

		let shortKeyToPath = {};
		createShortKeyToPathMap( shortKeyToPath, descriptor );
		
		const par = new URLSearchParams( urlParams );
					
		for( const [ shortKey, urlValue ] of par ) {		
			const path = shortKeyToPath[ shortKey ];
			if( typeof path === "undefined" ) {
				console.error( `Invalid URL param '${shortKey}'` );
				continue;
			}

			const childDescriptor = module.getMemberByPath( descriptor, path );
			if( ! ( childDescriptor instanceof Option ) ) {
				console.error( `Internal error: missing or invalid descriptor for URL param '${shortKey}', path: ${path}` );
				continue;
			}

			const parsedValue = childDescriptor.$deserialize( urlValue );
			if( parsedValue !== null ) {
				z42opt.setMemberByPath( result, path, parsedValue );
			}
		}
	
		return result;		
	}

	//------------------------------------------------------------------------------------------------

	module.optionsToUrlParams = function( options, descriptor ) {
		if( ! ( descriptor instanceof Node ) )
			throw new Error( "Invalid argument: descriptor must be instance of z42opt.Node" );

		let urlParams = new URLSearchParams();		
		
		createUrlParams( urlParams, options, descriptor );

		return urlParams.toString();
	}

	//------------------------------------------------------------------------------------------------
	// Get object member value by path.

	module.getMemberByPath = function( obj, path, separator = '.' ) {
		const properties = Array.isArray( path ) ? path : path.split( separator );
		return properties.reduce( ( prev, curr ) => prev && prev[ curr ], obj );
	}
	
	//------------------------------------------------------------------------------------------------
	// Set object member value by path.

	module.setMemberByPath = function( obj, path, value, separator = '.' ) {
		const properties = Array.isArray( path ) ? path : path.split( separator );
		properties.reduce( ( o, p, i ) => 
			o[ p ] = ( path.split('.').length === ++i ? value : o[ p ] || {} ), 
			obj );
	}

	//------------------------------------------------------------------------------------------------
	// Append childPath to basePath with given separator. Separator is not appended if basePath is empty.

	module.joinPath = function( basePath, childPath, separator = '.' ) {
		if( ! basePath || basePath.length == 0 )
			return childPath;
		return basePath + separator + childPath; 
	}
	
	//------------------------------------------------------------------------------------------------
	// Merge individual values of two objects recursively.
	// Values from source will be copied to the same path in target, overwriting any existing value or object.
	
	module.mergeObjectData = function( target, source, targetPath = null ) {
		for( const [ key, value ] of Object.entries( source ) ) {

			const path = module.joinPath( targetPath, key );
			
			if( typeof value === "object" )	{
				if( value !== null ) {
					// Recurse into child object.
					module.mergeObjectData( target, value, path );
				}
			}
			else {
				// Merge single value
				module.setMemberByPath( target, path, value );
			}
		}
	}	

	//================================================================================================
	// Private functions
	//================================================================================================

	function createShortKeyToPathMap( result, descriptor, path = null ) {
		for( const [ key, childDescriptor ] of Object.entries( descriptor ) ) {
			const childPath = module.joinPath( path, key );

			if( childDescriptor instanceof Option ){
				if( ! childDescriptor.$attrs.uniqueShortKey ){
					console.error( "Missing attribute uniqueShortKey for option:", childPath );
					continue;
				}  
				result[ childDescriptor.$attrs.uniqueShortKey ] = childPath; 
			}
			else {
				// Recurse into child child descriptor.
				createShortKeyToPathMap( result, childDescriptor, childPath );
			}
		}
	}

	//------------------------------------------------------------------------------------------------
	
	function createUrlParams( urlParams, options, rootDescriptor, path = null ) {
		
		// TODO: check for duplicates of uniqueShortKey

		for( const [ key, value ] of Object.entries( options ) ) {
			const childPath = module.joinPath( path, key );
			const childDescriptor = module.getMemberByPath( rootDescriptor, childPath );
			
			if( childDescriptor instanceof Option )	{
				if( ! childDescriptor.$attrs.uniqueShortKey ) {
					console.error( "Missing attribute uniqueShortKey for option:", childPath );
					continue;
				}
				const urlValue = childDescriptor.$serialize( value ); 
				urlParams.append( childDescriptor.$attrs.uniqueShortKey, urlValue );
			}
			else if( typeof value === "object" ) {			
				// Recurse
				createUrlParams( urlParams, value, rootDescriptor, childPath );
			}
			else {
				// Single value without descriptor -> this is an error
				console.error( "Missing descriptor for option:", childPath );
			}			
		}
	}	

	//------------------------------------------------------------------------------------------------

	function clampOptional( value, min = null, max = null ) {
		if( min && value < min ) return min;
		if( max && value > max ) return max;
		return value;
	}		

})(this);