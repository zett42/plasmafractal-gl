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
// The mapping is defined by constructor parameter 'paramsMap'.
//
// The pattern used for encapsulation is described by Douglas Crockford:
// http://crockford.com/javascript/private.html ("Private Members in JavaScript")

function z42ObjectToUrlParams( paramsMap )
{
	'use strict';
	
	//================================================================================================
	// Private
	//================================================================================================
	
	// Create reverse lookup map (short URL key -> object path).
	let m_revParamsMap = {};
	for( const [ objKey, urlKey ] of Object.entries( paramsMap ) ) 
	{
		m_revParamsMap[ urlKey ] = objKey;
	}	

	//------------------------------------------------------------------------------------------------
	
	function createUrlParamsInternal( urlParams, obj, parentPath = null )
	{
		for( let [ key, value ] of Object.entries( obj ) ) 
		{
			const path = parentPath ? parentPath + "." + key : key;
			
			if( typeof value === 'object' && value !== null )
			{
				// Recurse into nested objects
				createUrlParamsInternal( urlParams, value, path );
			}
			else
			{
				const urlKey = paramsMap[ path ];
				if( typeof urlKey === "undefined" )
				{
					console.warn( "No URL key defined for object member:", path );
					continue;
				}
				
				if( typeof value === "boolean" && value !== null )
				{
					value = value ? 1 : 0;
				}
				
				urlParams.append( urlKey, value );
			}
		}
	}	
	
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
			const path = m_revParamsMap[ key ];
			
			z42opt.setPath( result, path, value );
		}
		
		return result;
	}	
}