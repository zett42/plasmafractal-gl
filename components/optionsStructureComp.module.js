/*
Option UI components. Copyright (c) 2019 zett42.
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
//---------------------------------------------------------------------------------------------------

import "./optionsValueComp.module.js"
import "./optionsPaletteComp.module.js"
import * as z42opt from "./optionsDescriptor.module.js"
import * as z42optUtil from "./optionsUtils.module.js"

//---------------------------------------------------------------------------------------------------
// Component that generates tabs for the groups defined by the options view.

const tabsComponent = Vue.component( "z42opt-tabs", {
	inheritAttrs: false,		
	props: {
		id:       { type: String, required: true },
		value:    { type: Object, required: true },
		optDesc:  { type: z42opt.Node, required: true }, 
		optView:  { type: Object, required: true },
		tabIndex: { type: Number, required: false, default: 0 },
	},
	methods: {
		childId( key ) { 
			return z42optUtil.joinPath( this.id, key, "#" ); 
		},
		contentComponentName( group ){
			// Default component name can be overridden via optView (group.component).
			if( group.component )
				return group.component;

			// If group contains sub groups, create nested tabs. This works, but doesn't seem to be optimal.
			// Maybe a group box would be better suitable?
			if( group.groups )
				return 'z42opt-tabs';

			// Otherwise create a flat view of the options.
			return 'z42opt-container';
		},
	},
	template: /*html*/ `	
		<b-tabs 
			:value="tabIndex" 
			@input="$emit( 'update:tabIndex', $event )" 
			>
			<!-- Note: 'key' attribute required when using v-for with component (https://vuejs.org/v2/guide/list.html#v-for-with-a-Component) -->
			
			<b-tab v-for="( group, key ) in optView.groups"
				:key="childId( key )"
				:id="childId( key )"
				:title="group.title"
				>
				<component
					:is="contentComponentName( group )"
					:id="childId( key )" 
					:value="value"
					:optDesc="optDesc"
					:optView="group"
					class="container px-0"
				/>
			</b-tab>
		</b-tabs>
		`
});

//---------------------------------------------------------------------------------------------------
// Component that generates a flat list of components for the individual option values.

const containerComponent = Vue.component( "z42opt-container", {
	inheritAttrs: false,
	props: {
		id:      { type: String, required: true },
		value:   { type: Object, required: true },
		optDesc: { type: z42opt.Node, required: true }, 
		optView: { type: Object, required: true },
	},
	methods: {
		childId( key ) {  
			return z42optUtil.joinPath( this.id, key, "#" ); 
		},			
		// Return a flat array of options descriptors from given path.
		resolveOptDesc( path ){
			let node = _.get( this.optDesc, path );
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
			return _.get( this.value, path );
		},
		isAttrTrue( optDescChild, attrName ){
			const attr = optDescChild.$attrs[ attrName ];
			if( typeof attr === "undefined" )
				return true;
			if( typeof attr === "function" )
				return attr( this.value, this.optDesc );
			return Boolean( attr );
		},
		onModified( value, path ){
			const optDescNode = _.get( this.optDesc, path ); 
			if( optDescNode instanceof z42opt.Option ) {
				_.set( this.value, path, value );
			}
		}
	},
	template: /*html*/ `
		<div>
			<template v-for="basePath in optView.options">
				<template v-for="opt in resolveOptDesc( basePath )">
					<!-- Note: 'key' attribute required when using v-for with component (https://vuejs.org/v2/guide/list.html#v-for-with-a-Component) -->

					<transition name="z42opt-component-transition" mode="out-in">
						<component :is="opt.node.$component" 
							v-if="isAttrTrue( opt.node, 'isRendered' )" 
							v-show="isAttrTrue( opt.node, 'isShown' )"
							:disabled="! isAttrTrue( opt.node, 'isEnabled' )"
							:key="childId( opt.path )"
							:id="childId( opt.path )"
							:optDesc="opt.node" 
							:value="resolveValue( opt.path )"
							@input="onModified( $event, opt.path )"
						/>
					</transition>
				</template>
			</template>
		</div>
	`,
});	

//---------------------------------------------------------------------------------------------------

export {
	tabsComponent,
	containerComponent,		
}