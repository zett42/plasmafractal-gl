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
	
	//------------------------------------------------------------------------------------------------
	// Get object member value by path.

	module.resolve = function( obj, path, separator = '.' ) 
	{
		const properties = Array.isArray( path ) ? path : path.split( separator );
		return properties.reduce( ( prev, curr ) => prev && prev[ curr ], obj );
	}
	
	//------------------------------------------------------------------------------------------------
	// Set object member value by path.

	module.setPath = function( obj, path, value, separator = '.' )
	{
		const properties = Array.isArray( path ) ? path : path.split( separator );
		properties.reduce( ( o, p, i ) => 
			o[ p ] = ( path.split('.').length === ++i ? value : o[ p ] || {} ), 
			obj );
	}	
	
	//------------------------------------------------------------------------------------------------
	// Merge data of two objects recursively.
	// Copies individual values from source to target.
	
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
				module.setPath( target, path, value );
			}
		}
	}

})(this);
