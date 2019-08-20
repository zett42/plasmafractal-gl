/*
Dialog for m_plasma options. Copyright (c) 2019 zett42.
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
	let m_plasma = null;

	//-------------------------------------------------------------------------------------------------------------------
	// Init module.
	
	module.init = function( plasma )
	{
		m_plasma = plasma;
		
		$(optionsDialogButton).button().click( function( event ) {	
			if( $(optionsDialog).is(':parent') )
				showOptionsDialog();
			else
				$(optionsDialog).load( "optionsDialog.html", showOptionsDialog );
		});
	}

	//-------------------------------------------------------------------------------------------------------------------
	
	function showOptionsDialog()
	{
		$(optionsDialog).dialog({
			position: { my: "left top", at: "left+15 top+50" },			
			width: 400,
			// powered by jquery.dialogOptions.js
			clickOut: true,      // closes dialog when clicked outside
			responsive: true,    // fluid width & height based on viewport
			scaleW: 0.9,         // responsive scale height percentage of viewport (0..1)
			scaleH: 0.9,         // responsive scale width percentage of viewport (0..1)
			showTitleBar: true,  // false: hide titlebar

			create: onOptionsDialogCreate
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
		
		$("#tabs").tabs();		

		$('input').addClass("ui-widget-content ui-corner-all ui-widget");
		
		//----- Params Tab -----
				
		const minFreq = 0.05;
		const maxFreq = 15;
		const maxSlider = 90;                // positive positions set frequency from 1 to maxFreq
		const minSlider = -maxSlider / 3;    // negative positions set frequency from minFreq to 1
		
		let noiseOptions = m_plasma.getNoiseOptions();
		
		$("#frequencyInput")
			.val( noiseOptions.frequency )
			.change(function() {
				noiseOptions.frequency = $(this).val();	
				const newSliderVal = calcSliderValueFromInput( noiseOptions.frequency, minFreq, maxFreq, minSlider, maxSlider );
				$("#frequencySlider").slider( "value", newSliderVal );
			
				m_plasma.setNoiseOptions( noiseOptions );
			});
				
		$("#frequencySlider").slider({
			min  : minSlider,
			max  : maxSlider,
			value: calcSliderValueFromInput( noiseOptions.frequency, minFreq, maxFreq, minSlider, maxSlider ),

			slide: function( event, ui ) {
				noiseOptions.frequency = calcInputValueFromSlider( ui.value, minFreq, maxFreq, minSlider, maxSlider );
				$("#frequencyInput").val( noiseOptions.frequency );
			},
			change: function( event, ui ) {
				m_plasma.setNoiseOptions( noiseOptions );
			}
		});		
		
		$("#octavesSlider").slider({
			min  : 1,
			max  : 10,
			value: noiseOptions.octaves,   

			slide: function( event, ui ) {
				noiseOptions.octaves = ui.value;
			},
			change: function( event, ui ) {
				m_plasma.setNoiseOptions( noiseOptions );
			}
		});

		$("#gainSlider").slider({
			min  : 0.2 * 100,
			max  : 0.8 * 100,
			value: noiseOptions.gain * 100,   

			slide: function( event, ui ) {
				noiseOptions.gain = ui.value / 100;
			},
			change: function( event, ui ) {
				m_plasma.setNoiseOptions( noiseOptions );
			}
		});	
		
		$("#lacunaritySlider").slider({
			min  : 2 * 100,
			max  : 20 * 100,
			value: noiseOptions.lacunarity * 100,   

			slide: function( event, ui ) {
				noiseOptions.lacunarity = ui.value / 100;
			},
			change: function( event, ui ) {
				m_plasma.setNoiseOptions( noiseOptions );
			}
		});	
		
		$("#amplitudeSlider").slider({
			min  : 1 * 100,
			max  : 10 * 100,
			value: noiseOptions.amplitude * 100,   

			slide: function( event, ui ) {
				noiseOptions.amplitude = ui.value / 100;
			},
			change: function( event, ui ) {
				m_plasma.setNoiseOptions( noiseOptions );
			}
		});	

		//----- Palette Tab -----

		let paletteOptions  = m_plasma.getPaletteOptions();
		const easeFunctions = m_plasma.getAllPaletteEaseFunctions();

		const smBgToFg = $("#paletteEasingBgToFg");
		const smFgToBg = $("#paletteEasingFgToBg");
		
		easeFunctions.forEach( function( name, index ){
			appendOption( smBgToFg, { text: name, selected: name == paletteOptions.easeFunctionBgToFg } );
			appendOption( smFgToBg, { text: name, selected: name == paletteOptions.easeFunctionFgToBg } );
		});

		smBgToFg.selectmenu({
			width: 140,
			position: { my: "left top", at: "left bottom", collision: "flip" },
			select: function( event, ui ) { 
				paletteOptions.easeFunctionBgToFg = ui.item.value;
				m_plasma.setPaletteOptions( paletteOptions );
			}
		})
		.selectmenu( "menuWidget" )
        .addClass( "selectOverflow" );
		
		smFgToBg.selectmenu({
			width: 140,
			position: { my: "left top", at: "left bottom", collision: "flip" },
			select: function( event, ui ) { 
				paletteOptions.easeFunctionFgToBg = ui.item.value;
				m_plasma.setPaletteOptions( paletteOptions );
			}
		})
		.selectmenu( "menuWidget" )
        .addClass( "selectOverflow" );
	
		
		$("#paletteSaturationSlider").slider({
			min  : 0,
			max  : 100,
			value: paletteOptions.saturation * 100,   

			slide: function( event, ui ) {
				paletteOptions.saturation = ui.value / 100;
				m_plasma.setPaletteOptions( paletteOptions );
			}
		});			

		$("#paletteValueSlider").slider({
			min  : 0,
			max  : 100,
			value: paletteOptions.brightness * 100,   

			slide: function( event, ui ) {
				paletteOptions.brightness = ui.value / 100;
				m_plasma.setPaletteOptions( paletteOptions );
			}
		});
		
		let bgColorChanged = false;
		let oldBackgroundRGBA = paletteOptions.backgroundRGBA;
		
		$("#bgColorPicker").spectrum({
			theme: "sp-dark",
			color: paletteOptions.backgroundRGBA,
			
			show: function( color ) {
				bgColorChanged = false;	
				oldBackgroundRGBA = paletteOptions.backgroundRGBA;				
			},
			move: function( color ) {
				paletteOptions.backgroundRGBA = color.toRgb();
				paletteOptions.backgroundRGBA.a = 255;
				m_plasma.setPaletteOptions( paletteOptions );
			},
		    change: function( color ) {
				bgColorChanged = true;	
			},
			hide: function() {
				if( ! bgColorChanged )
				{
					paletteOptions.backgroundRGBA = oldBackgroundRGBA;
					m_plasma.setPaletteOptions( paletteOptions );
				}
			}
		});
		
		$("#grayScaleCheckBox").checkboxradio()
			.prop("checked", paletteOptions.isGrayScale )
			.on("change", function(event){
				paletteOptions.isGrayScale = $(this).prop("checked");
				m_plasma.setPaletteOptions( paletteOptions );
			});
					
		//----- Animation Tab -----
		
		let animationOptions = m_plasma.getAnimationOptions();
		
		$("#animationSpeedSlider").slider({
			min  : 0,
			max  : 100,
			value: animationOptions.paletteRotationSpeed * 100,   

			change: function( event, ui ) {
				animationOptions.paletteRotationSpeed = ui.value / 100;
				m_plasma.setAnimationOptions( animationOptions );
			}
		});		

		$("#paletteConstantSlider").slider({
			min  :  0 * 1000,
			max  : 30 * 1000,
			value: animationOptions.paletteConstantMillis,   

			change: function( event, ui ) {
				animationOptions.paletteConstantMillis = ui.value;
				m_plasma.setAnimationOptions( animationOptions );
			}
		});		
		
		$("#paletteTransitionSlider").slider({
			min  :  1 * 1000,
			max  : 30 * 1000,
			value: animationOptions.paletteTransitionMillis,   

			change: function( event, ui ) {
				animationOptions.paletteTransitionMillis = ui.value;
				m_plasma.setAnimationOptions( animationOptions );
			}
		});
	}

	//-------------------------------------------------------------------------------------------------------------------
	
	function appendOption( selectElement, opt ){
		let optElem = $("<option></option>");
		optElem.text( opt.text );
		if( opt.selected )
			optElem.attr( "selected", true );
		selectElement.append( optElem );
	}	
	
})(this);
