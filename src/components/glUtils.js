/*
WebGL utilities. Copyright (c) 2019 zett42
https://github.com/zett42/plasmafractal-gl

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
//----------------------------------------------------------------------------------------------

export function buildShaderProgram( gl, vertexShaderSrc, fragmentShaderSrc ) {
    const program = gl.createProgram();

    const vShader = compileShader( gl, vertexShaderSrc,   gl.VERTEX_SHADER );
    const fShader = compileShader( gl, fragmentShaderSrc, gl.FRAGMENT_SHADER );

    if( vShader ) 
        gl.attachShader( program, vShader );
    if( fShader ) 
        gl.attachShader( program, fShader );

    gl.linkProgram( program );

    if( ! gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
        throw new Error( "Error linking shader program:\n" + gl.getProgramInfoLog( program ) );
    }

    return program;
}

//----------------------------------------------------------------------------------------------

export function compileShader( gl, code, type ) {
    const shader = gl.createShader(type);

    gl.shaderSource( shader, code );
    gl.compileShader( shader );

    if ( ! gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
        console.error( `Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:` );
        console.error( gl.getShaderInfoLog(shader));
    }
    return shader;
}

//----------------------------------------------------------------------------------------------
// Helper class to get/set WebGL shader uniform variables by name.

export class Uniforms {
    constructor( gl, program, isDebug = false ) {
        this._gl = gl;
        this._isDebug = isDebug;
        this._locations = {};

        // Get locations of all active uniform variables of given program.
        const uniformCount = gl.getProgramParameter( program, gl.ACTIVE_UNIFORMS );
        for( let i = 0; i < uniformCount; ++i ){
            const uniform = gl.getActiveUniform( program, i );
            const loc     = gl.getUniformLocation( program, uniform.name );
            if( ! loc ) {
                throw new Error( `Could not get uniform location for '${uniform.name}'` );
            }
            this._locations[ uniform.name ] = loc;
        }

        ! isDebug || console.debug( "Active uniforms:", Object.keys( this._locations ) );
    }

    location( name ) {
        let loc = this._locations[ name ];
        if( ! loc ) {
            ! this._isDebug || console.error( `Could not get uniform location for '${name}'` );
        }
        return loc;
    }

    _call( glFunction, name, ...args ) {
        ! this._isDebug || console.debug( `uniform ${name} =`, ...args );
        this._gl[ glFunction ]( this.location( name ), ...args );
    }

    uniform1f( name, v0 )             { this._call( "uniform1f", name, v0 ); }
    uniform1fv( name, value )         { this._call( "uniform1fv", name, value ); }
    uniform1i( name, v0 )             { this._call( "uniform1i", name, v0 ); }
    uniform1iv( name, value )         { this._call( "uniform1iv", name, value ); }

    uniform2f( name, v0, v1 )         { this._call( "uniform2f", name, v0, v1 ); }
    uniform2fv( name, value )         { this._call( "uniform2fv", name, value ); }
    uniform2i( name, v0, v1 )         { this._call( "uniform2i", name, v0, v1 ); }
    uniform2iv( name, value )         { this._call( "uniform2iv", name, value ); }

    uniform3f( name, v0, v1, v2 )     { this._call( "uniform3f", name, v0, v1, v2 ); }
    uniform3fv( name, value )         { this._call( "uniform3fv", name, value ); }
    uniform3i( name, v0, v1, v2 )     { this._call( "uniform3i", name, v0, v1, v2 ); }
    uniform3iv( name, value )         { this._call( "uniform3iv", name, value ); }

    uniform4f( name, v0, v1, v2, v3 ) { this._call( "uniform4f", name, v0, v1, v2, v3 ); }
    uniform4fv( name, value )         { this._call( "uniform4fv", name, value ); }
    uniform4i( name, v0, v1, v2, v3 ) { this._call( "uniform4i", name, v0, v1, v2, v3 ); }
    uniform4iv( name, value )         { this._call( "uniform4iv", name, value ); }  
    
    getUniform( name ) {
        return this._gl.getUniform( this._program, this.location( name ) );
    }
}

//----------------------------------------------------------------------------------------------

export function setBufferRectangle( gl, x, y, width, height, usage = gl.STATIC_DRAW ) {
    let x1 = x;
    let x2 = x + width;
    let y1 = y;
    let y2 = y + height;
    gl.bufferData( gl.ARRAY_BUFFER, 
        new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2 
        ]), 
        usage 
    );
}
