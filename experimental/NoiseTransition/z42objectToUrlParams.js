/*
Conversion of data object to URL params. Copyright (c) 2019 zett42.
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
//------------------------------------------------------------------------------------------------
// Class for mapping data object (like options) to short URL params and vice versa.
// The mapping is defined by constructor parameter 'paramsDefinition'.
//
// The pattern used for encapsulation is described by Douglas Crockford:
// http://crockford.com/javascript/private.html ("Private Members in JavaScript")

function z42ObjectToUrlParams( paramsDefinition )
{
	'use strict';	
	
	//==================================================================================================
	// Public
	//==================================================================================================

	// Create short URL params from data object (no arrays). Object may have nested objects.

	this.createUrlParams = function( obj )
	{
		let urlParams = new URLSearchParams();
		
		createUrlParamsInternal( urlParams, obj );
		
		return urlParams.toString();
	}
	
	//--------------------------------------------------------------------------------------------------

	// Create object from short URL params.

	this.parseUrlParams = function( paramStr )
	{
		let result = {};
		
		var par = new URLSearchParams( paramStr );
			
		for( const [ key, value ] of par ) 
		{		
			const path = m_urlKeyToObjPath[ key ];
			if( typeof path === "undefined" )
			{
				console.warn( "Invalid URL param key: ", key );
				continue;
			}

			const paramDef = paramsDefinition[ path ];

			const parsedValue = parseOneUrlParam( value, paramDef );
			if( parsedValue !== null )
			{
				z42opt.setPath( result, path, parsedValue );
			}			
		}
		
		return result;
	}		
	
	//================================================================================================
	// Private
	//================================================================================================
	
	// Reverse lookup map (URL key -> object path).
	let m_urlKeyToObjPath = {};
	
	for( const [ objPath, value ] of Object.entries( paramsDefinition ) ) 
	{
		m_urlKeyToObjPath[ value.urlKey ] = objPath;
	}	

	//------------------------------------------------------------------------------------------------
	
	function createUrlParamsInternal( urlParams, obj, parentPath = null )
	{
		for( const [ key, value ] of Object.entries( obj ) ) 
		{
			const path = parentPath ? parentPath + "." + key : key;
			const paramDef = paramsDefinition[ path ];		

			if( paramDef )
			{
				const urlValue = createOneUrlParam( value, paramDef );		
				urlParams.append( paramDef.urlKey, urlValue );
			}
			else if( typeof value === "object" )
			{
				// Recurse into nested objects
				createUrlParamsInternal( urlParams, value, path );
			}
			else
			{
				// Single value without paramDef -> this is an error
				console.warn( "Missing paramsDefinition entry for object path:", path );
			}
		}
	}	

	//------------------------------------------------------------------------------------------------

	function createOneUrlParam( value, paramDef )
	{
		switch( paramDef.type )
		{
			case "boolean":
			{
				return value ? 1 : 0;
			}
			break;			

			case "int":
			{
				return value;
			}
			break;

			case "float":
			{
				if( typeof paramDef.maxFractionDigits !== "undefined" )
				{
					return Number( value ).toFixed( paramDef.maxFractionDigits );
				}
				return value;
			}	
			break;

			case "enum":
			{
				return value;
			}		
			break;			
			
			case "rgbColor":
			{
				return tinycolor( value ).toHex();
			}			
			break;
			
			default:
				console.warn( "Unknown URL param type:", paramDef.type );
				return null;
		}
	}
	
	//------------------------------------------------------------------------------------------------

	function parseOneUrlParam( value, paramDef )
	{
		switch( paramDef.type )
		{
			case "boolean":
			{
				const valueLCase = value.toString().toLowerCase();
				return ( valueLCase === "true" || valueLCase === "1" );
			}
			break;			

			case "int":
			{
				value = parseInt( value, 10 );
				if( isNaN( value ) )
				{
					console.warn( "Invalid URL param (type int): ", paramDef.urlKey );
					return null;
				}
				return clampOptional( Math.ceil( value ), paramDef.min, paramDef.max ); 
			}
			break;

			case "float":
			{
				value = parseFloat( value );
				if( isNaN( value ) )
				{
					console.warn( "Invalid URL param (type float): ", paramDef.urlKey );
					return null;
				}
				return clampOptional( value, paramDef.min, paramDef.max ); 				
			}	
			break;

			case "enum":
			{
				for( const ev of paramDef.enumValues ) 
				{
					if( ev.toLowerCase() === String( value ).toLowerCase() )
					{
						return ev;
					}
				}
				console.warn( "Invalid URL param (type enum): ", paramDef.urlKey );
				return null;
			}		
			break;			
			
			case "rgbColor":
			{
				const color = tinycolor( value );
				if( ! color.isValid()  )
				{
					console.warn( "Invalid URL param (type rgbColor): ", paramDef.urlKey );
					return null;					
				}
				
				return color.toRgb(); // keep it pure data to simplify merging
			}			
			break;
			
			default:
				console.warn( "Unknown URL param type:", paramDef.type );
				return null;
		}
	}

	//------------------------------------------------------------------------------------------------
	
	/// Clamp x to min (optional) and max (optional).

	function clampOptional( x, min = null, max = null )
	{
		if( min && x < min ) return min;
		if( max && x > max ) return max;
		return x;
	}	
}