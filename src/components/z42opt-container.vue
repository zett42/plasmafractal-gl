<!--
Option UI components. Copyright (c) 2019 zett42.
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

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Component that generates a flat list of components for the individual option values.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->

<template>
	<div>
		<template v-for="basePath in optView.options">
			<template v-for="opt in resolveOptDesc( basePath )">
				
				<!-- Component for manipulating a single option value -->
				<component :is="opt.node.$component" 
					v-if="isAttrTrue( opt.node, 'depends' )" 
					:disabled="! isAttrTrue( opt.node, 'enabled' )"
					:key="childId( opt.path )"
					:id="childId( opt.path )"
					:optDesc="opt.node" 
					:value="resolveValue( opt.path )"
					@input="onModified( opt.path, $event )"
				/>
			</template>
		</template>
	</div>
</template>

<!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->

<script>
import * as z42opt from "./optionsDescriptor";
import * as z42optUtil from "./optionsUtils";

export default {
	name: "z42opt-container",
	inheritAttrs: false,

	props: {
		id:      { type: String, required: true },
		optData: { type: Object, required: true },
		optDesc: { type: z42opt.Node, required: true }, 
		optView: { type: Object, required: true },
	},
	methods: {
		childId( key ) {  
			return z42optUtil.joinPath( this.id, key, "#" ); 
		},			
		// Return a flat array of options descriptors from given path. 
		// Path can be empty (not null!) to return all children of root options descriptor.
		resolveOptDesc( path ){
			if( path == null ) {
				return [];
			}
			const node = ( path.length === 0 ?
			               this.optDesc :
						   _.get( this.optDesc, path ) );
		
			if( node instanceof z42opt.Option ){
				return [{ path: path, node: node }];
			}
			let res = [];
			for( const key of Object.keys( node ) ){
				const childPath = z42optUtil.joinPath( path, key );
				// Recurse to append child option descriptors
				res = res.concat( this.resolveOptDesc( childPath ) );
			}
			return res;
		},	
		resolveValue( path ){
			return _.get( this.optData, path );
		},
		isAttrTrue( optDescChild, attrName ){
			const attr = optDescChild.$attrs[ attrName ];
			if( typeof attr === "undefined" )
				return true;
			if( typeof attr === "function" )
				return attr( this.optData, this.optDesc );
			return Boolean( attr );
		},
		onModified( path, value ){
			const optDescNode = _.get( this.optDesc, path ); 
			if( optDescNode instanceof z42opt.Option ) {
				// Send new option value to parent component, instead of modifying this.value directly.
				// This way parent component has more control about changes.
				this.$emit( "opt-modified", { path: path, value: value } );
			}
		}
	}
}
</script>