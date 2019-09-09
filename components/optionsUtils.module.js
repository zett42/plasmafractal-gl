/*
Option utilities. Copyright (c) 2019 zett42.
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
//------------------------------------------------------------------------------------------------

import * as z42opt from "./optionsDescriptor.module.js"

//------------------------------------------------------------------------------------------------
// Get the default option values from optionsDescriptor and merge them with the given URL params.

function mergeDefaultsWithUrlParams( optionsDescriptor, urlParams )
{
	let defaults = {};
	setDefaultOptions( defaults, optionsDescriptor );

	console.log( "Default options:", JSON.parse( JSON.stringify( defaults ) ) );

	// Deserialize and validate URL parameters.	
	let result = optionsFromUrlParams( urlParams, optionsDescriptor );
	if( ! result )
		return defaultValues;

	console.log( "URL params:", JSON.parse( JSON.stringify( result ) ) );

	_.defaultsDeep( result, defaults );

	console.log( "Merged options:", JSON.parse( JSON.stringify( result ) ) );

	return result;
}	

//------------------------------------------------------------------------------------------------
// Set values in options object to the default values obtained from descriptor.

function setDefaultOptions( result, descriptor, resultPath = null ) {
	if( ! ( descriptor instanceof z42opt.Node ) )
		throw new Error( "Invalid argument: descriptor must be instance of z42opt.Node" );

	for( const [ key, childDescriptor ] of Object.entries( descriptor ) ) {
		const childPath = joinPath( resultPath, key );

		if( childDescriptor instanceof z42opt.Option ){
			let defaultVal = childDescriptor.$attrs.defaultVal; 
			if( typeof defaultVal === "undefined" ){
				console.error( "Missing attribute defaultVal for option:", childPath );
				defaultVal = null;
			}
			// Set default value by path.
			_.set( result, childPath, defaultVal );
		}
		else {
			// Recurse into child descriptor.
			setDefaultOptions( result, childDescriptor, childPath );
		}
	}
}

//------------------------------------------------------------------------------------------------

function optionsFromUrlParams( urlParams, descriptor ) {
	if( ! ( descriptor instanceof z42opt.Node ) )
		throw new Error( "Invalid argument: descriptor must be instance of z42opt.Node" );

	let result = {};

	validateUniqueShortKeys( descriptor );	

	let shortKeyToPath = {};
	createShortKeyToPathMap( shortKeyToPath, descriptor );
	
	const par = new URLSearchParams( urlParams );
				
	for( const [ shortKey, urlValue ] of par ) {		
		const path = shortKeyToPath[ shortKey ];
		if( typeof path === "undefined" ) {
			console.error( `Invalid URL param '${shortKey}'` );
			continue;
		}

		const childDescriptor = _.get( descriptor, path );
		if( ! ( childDescriptor instanceof z42opt.Option ) ) {
			console.error( `Internal error: missing or invalid descriptor for URL param '${shortKey}', path: ${path}` );
			continue;
		}

		const parsedValue = childDescriptor.$deserialize( urlValue );
		if( parsedValue !== null ) {
			_.set( result, path, parsedValue );
		}
	}

	return result;		
}

//------------------------------------------------------------------------------------------------

function optionsToUrlParams( options, descriptor ) {
	if( ! ( descriptor instanceof z42opt.Node ) )
		throw new Error( "Invalid argument: descriptor must be instance of z42opt.Node" );

	validateUniqueShortKeys( descriptor );	
	
	let urlParams = new URLSearchParams();		
	
	createUrlParams( urlParams, options, descriptor );

	return urlParams.toString();
}

//------------------------------------------------------------------------------------------------
// Append childPath to basePath with given separator. Separator is not appended if basePath is empty.

function joinPath( basePath, childPath, separator = '.' ) {
	if( ! basePath || basePath.length == 0 )
		return childPath;
	return basePath + separator + childPath; 
}

//------------------------------------------------------------------------------------------------
// Create permalink from options.

function createPermalink( optionsData, optionsDescriptor, url ) {

	const urlParams = optionsToUrlParams( optionsData, optionsDescriptor );

	// Remove sub string after "#" and "?", if exists.
	const baseUrl = url.split( "#" )[ 0 ].split( "?" )[ 0 ];

	return baseUrl + "?" + urlParams;
}	

//================================================================================================
// Private functions
//================================================================================================

// Validate uniqueShortKey attribute of options descriptor and log any errors to console.
// - all Option descriptors must have a uniqueShortKey attribute
// - no duplicates
// - short key is all lowercase

function validateUniqueShortKeys( descriptor ) {
	let shortKeyMap = new Map();
	validateShortKeysRecursively( shortKeyMap, descriptor );
	
	for( const [ key, value ] of shortKeyMap.entries() ){
		if( value.length > 1 ){
			console.error( `Duplicate value '${key}' of attribute 'uniqueShortKey' detected for the following options:`, value );
		}
	}
}

//------------------------------------------------------------------------------------------------

function validateShortKeysRecursively( result, descriptor, path = null ) {

	for( const [ key, childDescriptor ] of Object.entries( descriptor ) ) {
		const childPath = joinPath( path, key );

		if( childDescriptor instanceof z42opt.Option ){
			const shortKey = childDescriptor.$attrs.uniqueShortKey;
			if( ! shortKey ){
				console.error( "Missing attribute 'uniqueShortKey' for option:", childPath );
				continue;
			}
			const shortKeyLCase = shortKey.toLowerCase();
			if( shortKeyLCase !== shortKey ){
				console.error( "Attribute 'uniqueShortKey' is not all lowercase for option:", childPath );
				continue;
			}
			// To detect dupes.
			if( result.has( shortKey ) ) {
				result.get( shortKey ).push( childPath );
			}
			else {
				result.set( shortKey, [ childPath ] );
			}
		}
		else {
			// Recurse into child descriptor.
			validateShortKeysRecursively( result, childDescriptor, childPath );
		}
	}
}

//------------------------------------------------------------------------------------------------

function createShortKeyToPathMap( result, descriptor, path = null ) {

	for( const [ key, childDescriptor ] of Object.entries( descriptor ) ) {
		const childPath = joinPath( path, key );

		if( childDescriptor instanceof z42opt.Option ){
			result[ childDescriptor.$attrs.uniqueShortKey ] = childPath;
		}
		else {
			// Recurse into child descriptor.
			createShortKeyToPathMap( result, childDescriptor, childPath );
		}
	}
}

//------------------------------------------------------------------------------------------------

function createUrlParams( urlParams, options, rootDescriptor, path = null ) {

	for( const [ key, value ] of Object.entries( options ) ) {
		const childPath = joinPath( path, key );
		const childDescriptor = _.get( rootDescriptor, childPath );
		
		if( childDescriptor instanceof z42opt.Option )	{
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

export { 
	mergeDefaultsWithUrlParams,
	setDefaultOptions,
	optionsFromUrlParams,
	optionsToUrlParams,
	joinPath,
	createPermalink,
}