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
	
	//--------------------------------------------------------------------------------------------------------------
	// Get object member value by path.

	module.resolve = function( obj, path, separator = '.' ) 
	{
		const properties = Array.isArray( path ) ? path : path.split( separator );
		return properties.reduce( ( prev, curr ) => prev && prev[ curr ], obj );
	}
	
	//--------------------------------------------------------------------------------------------------------------
	// Set object member value by path.

	module.setPath = function( obj, path, value, separator = '.' )
	{
		const properties = Array.isArray( path ) ? path : path.split( separator );
		properties.reduce( ( o, p, i ) => 
			o[ p ] = ( path.split('.').length === ++i ? value : o[ p ] || {} ), 
			obj );
	}	

	//--------------------------------------------------------------------------------------------------------------
	// Copy member by path from input to output if it exists and is a number within the range defined by min and max.

	module.mergeNumOption = function( output, input, path, min = null, max = null )
	{		
		const inputValue = module.resolve( input, path );
		if( typeof inputValue === "undefined" )
			return;
		
		const value = Number( inputValue );
		if( isNaN( value ) )
		{
			console.warn( "Invalid numeric option: " + path );
			return;
		}
		
		if( ( min !== null && value < min ) || ( max !== null && value > max ) )
		{
			console.warn( "Numeric option out of range: " + path );
			return;		
		}
		
		module.setPath( output, path, value );
	}

	//--------------------------------------------------------------------------------------------------------------
	// Copy member by path from input to output if it exists and its value can be found in the enumValues array
	// Comparison with enumValues is case insensitive. Output will be the matching enumValues value.

	module.mergeEnumOption = function( output, input, path, enumValues )
	{
		const inputValue = module.resolve( input, path );
		if( typeof inputValue === "undefined" )
			return;

		for( const ev of enumValues ) 
		{
			if( ev.toLowerCase() === String( inputValue ).toLowerCase() )
			{
				module.setPath( output, path, ev );
				return;
			}
		}	

		console.warn( "Enum option out of range: " + path );
	}

	//--------------------------------------------------------------------------------------------------------------
	// Copy member by path from input to output if it exists, converting to boolean.

	module.mergeBoolOption = function( output, input, path )
	{
		const inputValue = module.resolve( input, path );
		if( typeof inputValue === "undefined" )
			return;

		const outValue = String( inputValue ).toLowerCase() === "true";
		
		module.setPath( output, path, outValue );
	}

})(this);
