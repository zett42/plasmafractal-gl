/*
Dialog for PlasmaFractal options. Copyright (c) 2019 zett42.
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
	
	let module = global.z42plasmaGui = {};
	
	let m_callbacks = null;
	let m_opt = null;

	//-------------------------------------------------------------------------------------------------------------------
	// Init module.
	// Parameter callbacks provides setter functions for options.
	
	module.init = function( callbacks, options )
	{
		m_callbacks = callbacks;
		m_opt = options;
		
		$(optionsDialogButton).button().click( function( event ) {	
			if( $("#optionsDialog").is(':parent') )
				showOptionsDialog();
			else
				$("#optionsDialog").load( "optionsDialog.html", showOptionsDialog );
		});

		window.onpopstate = function( ev ) {
			// Reload the state that onOptionsDialogClose() pushed to the history. 
			window.location.reload();
		};		
	}
	//-------------------------------------------------------------------------------------------------------------------
	
	function showOptionsDialog()
	{
		$("#optionsDialog").dialog({
			position: { my: "left top", at: "left+15 top+50" },			
			width: 400,
			// powered by jquery.dialogOptions.js
			clickOut: true,      // closes dialog when clicked outside
			responsive: true,    // fluid width & height based on viewport
			scaleW: 0.9,         // responsive scale height percentage of viewport (0..1)
			scaleH: 0.9,         // responsive scale width percentage of viewport (0..1)
			showTitleBar: true,  // false: hide titlebar

			create: onOptionsDialogCreate,
			close:  onOptionsDialogClose,
		});	
	}

	//-------------------------------------------------------------------------------------------------------------------
	
	function onOptionsDialogCreate( event, ui )
	{
		function calcSliderValueFromInput( inputValue, minValue, maxValue, minSlider, maxSlider )
		{
			let result = 0;
			if( inputValue < 1 )
				result = minSlider - minSlider * ( inputValue - minValue ) / ( 1 - minValue );  
			else
				result = maxSlider * ( inputValue - 1 ) / ( maxValue - 1 );

			return z42color.clamp( result, minSlider, maxSlider );
		}		
		
		function calcInputValueFromSlider( sliderValue, minValue, maxValue, minSlider, maxSlider )
		{
			if( sliderValue < 0 )
				return minFreq + ( 1 - ( sliderValue / minSlider ) ) * ( 1 - minFreq );
			else
				return 1 + ( sliderValue / maxSlider ) * ( maxFreq - 1 );
		}
		
		updatePermalink();
		
		$("#tabs").tabs();		

		$('input').addClass("ui-widget-content ui-corner-all ui-widget");
		
		//----- Params Tab -----
				
		const minFreq = 0.05;
		const maxFreq = 15;
		const maxSlider = 90;                // positive positions set frequency from 1 to maxFreq
		const minSlider = -maxSlider / 3;    // negative positions set frequency from minFreq to 1
		
		$("#frequencyInput")
			.val( m_opt.noise.frequency )
			.change(function() {
				m_opt.noise.frequency = $(this).val();	
				const newSliderVal = calcSliderValueFromInput( m_opt.noise.frequency, minFreq, maxFreq, minSlider, maxSlider );
				$("#frequencySlider").slider( "value", newSliderVal );
			
				setNoiseOptions();
			});
				
		$("#frequencySlider").slider({
			min  : minSlider,
			max  : maxSlider,
			value: calcSliderValueFromInput( m_opt.noise.frequency, minFreq, maxFreq, minSlider, maxSlider ),

			slide: function( event, ui ) {
				m_opt.noise.frequency = calcInputValueFromSlider( ui.value, minFreq, maxFreq, minSlider, maxSlider );
				$("#frequencyInput").val( m_opt.noise.frequency );
			},
			change: function( event, ui ) {
				setNoiseOptions();
			}
		});		
		
		$("#octavesSlider").slider({
			min  : 1,
			max  : 10,
			value: m_opt.noise.octaves,   

			slide: function( event, ui ) {
				m_opt.noise.octaves = ui.value;
			},
			change: function( event, ui ) {
				setNoiseOptions();
			}
		});

		$("#gainSlider").slider({
			min  : 0.2 * 100,
			max  : 0.8 * 100,
			value: m_opt.noise.gain * 100,   

			slide: function( event, ui ) {
				m_opt.noise.gain = ui.value / 100;
			},
			change: function( event, ui ) {
				setNoiseOptions();
			}
		});	
		
		$("#lacunaritySlider").slider({
			min  : 2 * 100,
			max  : 20 * 100,
			value: m_opt.noise.lacunarity * 100,   

			slide: function( event, ui ) {
				m_opt.noise.lacunarity = ui.value / 100;
			},
			change: function( event, ui ) {
				setNoiseOptions();
			}
		});	
		
		$("#amplitudeSlider").slider({
			min  : 1 * 100,
			max  : 50 * 100,
			value: m_opt.noise.amplitude * 100,   

			slide: function( event, ui ) {
				m_opt.noise.amplitude = ui.value / 100;
			},
			change: function( event, ui ) {
				setNoiseOptions();
			}
		});	

		//----- Palette Tab -----

		const smBgToFg = $("#paletteEasingBgToFg");
		const smFgToBg = $("#paletteEasingFgToBg");
		
		z42plasmaOptions.availablePaletteEaseFunctions.forEach( function( name, index ){
			appendOption( smBgToFg, { text: name, selected: name == m_opt.palette.easeFunctionBgToFg } );
			appendOption( smFgToBg, { text: name, selected: name == m_opt.palette.easeFunctionFgToBg } );
		});

		smBgToFg.selectmenu({
			width: 140,
			position: { my: "left top", at: "left bottom", collision: "flip" },
			select: function( event, ui ) { 
				m_opt.palette.easeFunctionBgToFg = ui.item.value;
				setPaletteOptions();
			}
		})
		.selectmenu( "menuWidget" )
        .addClass( "selectOverflow" );
		
		smFgToBg.selectmenu({
			width: 140,
			position: { my: "left top", at: "left bottom", collision: "flip" },
			select: function( event, ui ) { 
				m_opt.palette.easeFunctionFgToBg = ui.item.value;
				setPaletteOptions();
			}
		})
		.selectmenu( "menuWidget" )
        .addClass( "selectOverflow" );
	
		
		$("#paletteSaturationSlider").slider({
			min  : 0,
			max  : 100,
			value: m_opt.palette.saturation * 100,   

			slide: function( event, ui ) {
				m_opt.palette.saturation = ui.value / 100;
				setPaletteOptions();
			}
		});			

		$("#paletteValueSlider").slider({
			min  : 0,
			max  : 100,
			value: m_opt.palette.brightness * 100,   

			slide: function( event, ui ) {
				m_opt.palette.brightness = ui.value / 100;
				setPaletteOptions();
			}
		});
		
		let bgColorChanged = false;
		let oldBgColor = { ...m_opt.palette.bgColor };
		
		$("#bgColorPicker").spectrum({
			theme: "sp-dark",
			color: tinycolor( m_opt.palette.bgColor ).toHex(),
			
			show: function( color ) {
				bgColorChanged = false;	
				oldBgColor = { ...m_opt.palette.bgColor };				
			},
			move: function( color ) {
				console.log( "color:", color );
				m_opt.palette.bgColor = color.toRgb();
				setPaletteOptions();
			},
		    change: function( color ) {
				bgColorChanged = true;	
			},
			hide: function() {
				if( ! bgColorChanged )
				{
					m_opt.palette.bgColor = oldBgColor;
					setPaletteOptions();
				}
			}
		});
		
		$("#grayScaleCheckBox").checkboxradio()
			.prop("checked", m_opt.palette.isGrayScale )
			.on("change", function(event){
				m_opt.palette.isGrayScale = $(this).prop("checked");
				setPaletteOptions();
			});
					
		//----- Animation Tab -----
				
		const rotaDurationMin =  5 * 1000;
		const rotaDurationMax = 60 * 1000;
		const rotaDurationRange = rotaDurationMax - rotaDurationMin;
		
		$("#animationSpeedSlider").slider({
			min  : 0,
			max  : rotaDurationRange,
			value: rotaDurationMin + rotaDurationRange - m_opt.paletteAnim.rotaDuration,   

			change: function( event, ui ) {
				m_opt.paletteAnim.rotaDuration = rotaDurationMin + rotaDurationRange - ui.value;
				setPaletteAnimOptions();
			}
		});		

		$("#paletteTransitionDelaySlider").slider({
			min  :  0 * 1000,
			max  : 30 * 1000,
			value: m_opt.paletteAnim.transitionDelay,   

			change: function( event, ui ) {
				m_opt.paletteAnim.transitionDelay = ui.value;
				setPaletteAnimOptions();
			}
		});		
		
		$("#paletteTransitionDurationSlider").slider({
			min  :  1 * 1000,
			max  : 30 * 1000,
			value: m_opt.paletteAnim.transitionDuration,   

			change: function( event, ui ) {
				m_opt.paletteAnim.transitionDuration = ui.value;
				setPaletteAnimOptions();
			}
		});
				
		$("#noiseTransitionDelaySlider").slider({
			min  :  0 * 1000,
			max  : 60 * 1000,
			value: m_opt.noiseAnim.transitionDelay,   

			change: function( event, ui ) {
				m_opt.noiseAnim.transitionDelay = ui.value;
				setNoiseAnimOptions();
			}
		});		
		
		$("#noiseTransitionDurationSlider").slider({
			min  :  1 * 1000,
			max  : 30 * 1000,
			value: m_opt.noiseAnim.transitionDuration,   

			change: function( event, ui ) {
				m_opt.noiseAnim.transitionDuration = ui.value;
				setNoiseAnimOptions();
			}
		});			
	}

	//-------------------------------------------------------------------------------------------------------------------
	
	function onOptionsDialogClose( event, ui )
	{
		// Make it possible to use the browser back button to revert the current options.
		window.history.pushState( { action: "optionsDialogClose" }, document.title, $("#permaLink").attr( "href" ) );
	}	
	//-------------------------------------------------------------------------------------------------------------------
	
	function appendOption( selectElement, opt ){
		let optElem = $("<option></option>");
		optElem.text( opt.text );
		if( opt.selected )
			optElem.attr( "selected", true );
		selectElement.append( optElem );
	}
	//-------------------------------------------------------------------------------------------------------------------
	
	function setNoiseOptions()
	{
		m_callbacks.onChangedNoiseOptions( m_opt.noise );
		updatePermalink();
	}
	
	function setPaletteOptions()
	{
		m_callbacks.onChangedPaletteOptions( m_opt.palette );
		updatePermalink();
	}
	
	function setPaletteAnimOptions()
	{
		m_callbacks.onChangedPaletteAnimOptions( m_opt.paletteAnim );
		updatePermalink();
	}
	
	function setNoiseAnimOptions()
	{
		m_callbacks.onChangedNoiseAnimOptions( m_opt.noiseAnim );
		updatePermalink();
	}
	//-------------------------------------------------------------------------------------------------------------------
	
	function updatePermalink()
	{
		// Serialize all options to URL parameters.
		
		const urlParams = z42plasmaOptions.urlParamsMapper.createUrlParams( m_opt );

		let href = window.location.href;
		
		const iq = href.indexOf("?");
		if( iq >= 0 )
		{
			href = href.substring( 0, iq );
		}
		
		href += "?" + urlParams;
		
		console.log( "permaLink:", href );
		
		$("#permaLink").attr( "href", href );
	}	
	
	
})(this);
