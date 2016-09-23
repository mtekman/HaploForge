
var HaploModeEvents = {

	shiftHaplotypes : function(delta)
	{
		sta_index += delta;
		end_index += delta;

		SliderHandler.updateInputsByIndex( sta_index, end_index );
		SliderHandler.updateSlide();
		redrawHaplos(false);
	
		haplo_layer.draw();
	},

	// Public
	addKeys : function(){
		HaploModeEvents._addArrowKeys();
		HaploModeEvents._addPageKeys();
	},

	removeKeys : function(){
		HaploModeEvents._removeArrowKeys();
		HaploModeEvents._removePageKeys();
	},


	// KeyEvents
	_addArrowKeys: function(){

		Keyboard.addKeyDownTask("ArrowDown", HaploModeEvents._keyScrollDown);
		Keyboard.addKeyDownTask("ArrowUp", HaploModeEvents._keyScrollUp);
	},

	_removeArrowKeys: function(){

		Keyboard.removeKeyDownTask("ArrowDown", HaploModeEvents._keyScrollDown);
		Keyboard.removeKeyDownTask("ArrowUp", HaploModeEvents._keyScrollUp);
	},

	// Page Events
	_addPageKeys : function (){
		Keyboard.addKeyDownTask("PageDown", HaploModeEvents._pageScrollDown )
		Keyboard.addKeyDownTask("PageUp", HaploModeEvents._pageScrollUp )
	},

	_removePageKeys : function (){
		Keyboard.removeKeyDownTask("PageDown", HaploModeEvents._pageScrollDown )
		Keyboard.removeKeyDownTask("PageUp", HaploModeEvents._pageScrollUp )
	},

	_keyScrollUp : function(){HaploModeEvents._keyScroller(-5);},
	_keyScrollDown:function(){HaploModeEvents._keyScroller( 5);},
	_pageScrollUp: function(){HaploModeEvents._keyScroller( -15);},
	_pageScrollDown: function(){HaploModeEvents._keyScroller(15);},

	_keyScroller: function(amount){
		HaploModeEvents.shiftHaplotypes(amount)
	},


	// Mouse Events
	_addMouseWheel: function(){
		if (document.addEventListener) {
        	document.addEventListener("mousewheel", HaploModeEvents._wheelHandler, false); //IE9, Chrome, Safari, Oper
        	document.addEventListener("wheel", HaploModeEvents._wheelHandler, false); //Firefox
    	} else {
        	document.attachEvent("onmousewheel", HaploModeEvents._wheelHandler); //IE 6/7/8
    	}
	},

	_removeMouseWheel: function(){
		if (document.addEventListener) {
        	document.removeEventListener("mousewheel", HaploModeEvents._wheelHandler, false); //IE9, Chrome, Safari, Oper
        	document.removeEventListener("wheel", HaploModeEvents._wheelHandler, false); //Firefox
    	} else {
        	document.detachEvent("onmousewheel", HaploModeEvents._wheelHandler); //IE 6/7/8
    	}
	},


	_scrollBarsNotMiddle: function(){
		var wh = window.innerHeight,
			st = document.body.scrollTop,
			sh = document.body.scrollHeight;

		// Scroll haplotypes only when scrollbars are
		// either at top or bottom.
		return (wh - st === wh || st + wh > sh);
	},

	_prevwheelstate : null,

	_wheelHandler: function(event){

		if (HaploModeEvents._scrollBarsNotMiddle())
		{
			var delta = event.detail;
			if (delta === 0){
				delta = (event.deltaY > 0)?3:-3;
			}

			var wheelstatechanged = false;

			if ((delta > 0 && HaploModeEvents._prevwheelstate < 0)
			  ||(delta < 0 && HaploModeEvents._prevwheelstate > 0))
			{
				wheelstatechanged = true
			}

			if (!wheelstatechanged){
				HaploModeEvents.shiftHaplotypes(delta);
			}
			HaploModeEvents._prevwheelstate = delta;
		}
	}
}