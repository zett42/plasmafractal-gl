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
	// Private base classes
	//================================================================================================

	class Base {
		constructor( params ){
			this.params = params;
		}

		hasChildren(){ return typeof this.children === "object"; }
	}

	//================================================================================================
	// Exported classes
	//================================================================================================

	class Group extends Base {
		constructor( params, children ){
			super( params );
			this.params = params;
			this.children = children;
		}
	}
	module.Group = Group;

	//------------------------------------------------------------------------------------------------

	class Option extends Base {
		constructor( params ){
			super( params );
		}

		serialize( value ) { return value.toString(); }
	
		deserialize( value ) { return value; }

		parseError( value ) {
			console.error( "Invalid option value:", value, ", descriptor:", this.params );
		}
	}
	module.Option = Option;

	//------------------------------------------------------------------------------------------------

	class IntOpt extends Option {
		constructor( params ){
			super( params );
		}

		deserialize( value ) {
			value = parseInt( value, 10 );
			if( isNaN( value ) )
			{
				this.parseError( value );
				return null;
			}
			return clampOptional( Math.ceil( value ), this.params.min, this.params.max );
		}
	}
	module.IntOpt = IntOpt;

	//------------------------------------------------------------------------------------------------

	class FloatOpt extends Option {
		constructor( params ){
			super( params );
		}

		serialize( value ) { 
			if( typeof this.params.maxFractionDigits !== "undefined" )
			{
				return Number( Number( value ).toFixed( this.params.maxFractionDigits ) );
			}
			return value;
		}

		deserialize( value ) {
			value = parseFloat( value );
			if( isNaN( value ) )
			{
				this.parseError( value );
				return null;
			}
			return clampOptional( value, this.params.min, this.params.max ); 			
		}
	}
	module.FloatOpt = FloatOpt;

	//------------------------------------------------------------------------------------------------

	class BoolOpt extends Option {
		constructor( params ){
			super( params );
		}

		serialize( value ) {
			return value ? "1" : "0";			
		}

		deserialize( value ) {
			const valueLCase = value.toString().toLowerCase();
			return ( valueLCase === "true" || valueLCase === "1" );
		}
	}
	module.BoolOpt = BoolOpt;

	//------------------------------------------------------------------------------------------------

	class EnumOpt extends Option {
		constructor( params ){
			super( params );
		}

		deserialize( value ) {
			for( const ev of this.params.enumValues ) 
			{
				if( ev.toLowerCase() === String( value ).toLowerCase() )
				{
					return ev;
				}
			}
			this.parseError( value );
			return null;
		}
	}
	module.EnumOpt = EnumOpt;

	//------------------------------------------------------------------------------------------------

	class ColorOpt extends Option {
		constructor( params ){
			super( params );
		}

		serialize( value ) {
			return tinycolor( value ).toHex();
		}

		deserialize( value ) {
			const color = tinycolor( value );
			if( ! color.isValid()  )
			{
				this.parseError( value );
				return null;					
			}
			
			return color.toRgb(); // keep it pure data to simplify merging			
		}
	}	
	module.ColorOpt = ColorOpt;

	//================================================================================================
	// Exported functions
	//================================================================================================
	
	// Get object member value by path.

	module.getMemberByPath = function( obj, path, separator = '.' ) 
	{
		const properties = Array.isArray( path ) ? path : path.split( separator );
		return properties.reduce( ( prev, curr ) => prev && prev[ curr ], obj );
	}
	
	//------------------------------------------------------------------------------------------------
	// Set object member value by path.

	module.setMemberByPath = function( obj, path, value, separator = '.' )
	{
		const properties = Array.isArray( path ) ? path : path.split( separator );
		properties.reduce( ( o, p, i ) => 
			o[ p ] = ( path.split('.').length === ++i ? value : o[ p ] || {} ), 
			obj );
	}	
	
	//------------------------------------------------------------------------------------------------
	// Merge individual values of two objects recursively.
	// Values from source will be copied to the same path in target, overwriting any existing value or object.
	
	module.mergeObjectData = function( target, source, targetPath = null )
	{
		for( const [ key, value ] of Object.entries( source ) ) 
		{
			const path = targetPath ? targetPath + "." + key : key;
			
			if( typeof value === "object" )
			{
				if( value !== null )
				{
					// Recurse into nested objects
					module.mergeObjectData( target, value, path );
				}
			}
			else
			{
				// Merge single value
				module.setMemberByPath( target, path, value );
			}
		}
	}

	//------------------------------------------------------------------------------------------------
	// Set values in options object to the default values obtained from descriptor.

	module.setDefaultOptions = function( result, descriptor, resultPath = null )
	{
		if( ! ( descriptor instanceof Base ) )
			throw new Error( "Invalid argument: descriptor must be instance of z42opt.Base" );

		if( typeof descriptor.params.defaultVal !== "undefined" )
		{
			// Set default value by path.
			module.setMemberByPath( result, resultPath, descriptor.params.defaultVal );
		}

		if( descriptor.hasChildren() )
		{
			for( const [ key, value ] of Object.entries( descriptor.children ) ) 
			{
				const childPath = resultPath ? resultPath + "." + key : key;

				// Recurse into sub tree.
				module.setDefaultOptions( result, value, childPath );
			}
		}
	}
	
	//------------------------------------------------------------------------------------------------

	module.optionsFromUrlParams = function( urlParams, descriptor )
	{
		if( ! ( descriptor instanceof Group ) )
			throw new Error( "Invalid argument: descriptor must be instance of z42opt.Group" );

		let result = {};

		let shortKeyToDescriptor = {};
		createShortKeyLookupMap( shortKeyToDescriptor, descriptor );
		
		const par = new URLSearchParams( urlParams );
					
		for( const [ shortKey, urlValue ] of par ) 
		{		
			const paths = shortKeyToDescriptor[ shortKey ];

			if( typeof paths === "undefined" )
			{
				console.error( "Invalid URL param key: ", shortKey );
				continue;
			}

			const childDescriptor = module.getMemberByPath( descriptor, paths.descriptorPath );
			if( ! ( childDescriptor instanceof Option ) )
			{
				console.error( "Internal error: missing or invalid descriptor for URL param key:", shortKey, ", path:", paths.descriptorPath );
				continue;
			}

			const parsedValue = childDescriptor.deserialize( urlValue );
			if( parsedValue !== null )
			{
				z42opt.setMemberByPath( result, paths.optionsPath, parsedValue );
			}
		}
	
		return result;		
	}

	//------------------------------------------------------------------------------------------------

	module.optionsToUrlParams = function( options, descriptor )
	{
		if( ! ( descriptor instanceof Group ) )
			throw new Error( "Invalid argument: descriptor must be instance of z42opt.Group" );

		let urlParams = new URLSearchParams();		
		
		createUrlParams( urlParams, options, descriptor );

		return urlParams.toString();
	}

	//================================================================================================
	// Private functions
	//================================================================================================

	function createShortKeyLookupMap( result, descriptor, optionsPath = null, descriptorPath = null )
	{
		if( typeof descriptor.params.shortKey !== "undefined" )
		{
			result[ descriptor.params.shortKey ] = { 
				optionsPath    : optionsPath,
				descriptorPath : descriptorPath 
			};
		}

		if( descriptor.hasChildren() )
		{
			for( const [ key, childDescriptor ] of Object.entries( descriptor.children ) ) 
			{
				const optionsChildPath    = optionsPath ? optionsPath + "." + key : key;
				const descriptorChildKey  = "children." + key;
				const descriptorChildPath = descriptorPath ? descriptorPath + "." + descriptorChildKey : descriptorChildKey;

				createShortKeyLookupMap( result, childDescriptor, optionsChildPath, descriptorChildPath );
			}
		}
	}

	//------------------------------------------------------------------------------------------------
	
	function createUrlParams( urlParams, options, descriptor, descriptorPath = null )
	{
		for( const [ key, value ] of Object.entries( options ) ) 
		{
			const descriptorChildKey  = "children." + key;
			const descriptorChildPath = descriptorPath ? descriptorPath + "." + descriptorChildKey : descriptorChildKey;

			const childDescriptor = module.getMemberByPath( descriptor, descriptorChildPath );
			if( childDescriptor instanceof Option )
			{
				const urlKey = childDescriptor.params.shortKey;
				if( ! urlKey )
				{
					console.error( "Missing shortKey for option descriptor:", descriptorChildPath );
					continue;
				}

				const urlValue = childDescriptor.serialize( value ); 
				urlParams.append( urlKey, urlValue );
			}
			else if( typeof value === "object" )
			{			
				// Recurse
				createUrlParams( urlParams, value, descriptor, descriptorChildPath );
			}
			else
			{
				// Single value without descriptor -> this is an error
				console.error( "Missing options descriptor:", descriptorPath );
			}			
		}
	}	

	//------------------------------------------------------------------------------------------------

	function clampOptional( value, min = null, max = null )
	{
		if( min && value < min ) return min;
		if( max && value > max ) return max;
		return value;
	}		

})(this);
