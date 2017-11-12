import { MouseWheel } from '/JS/iofuncs/mousewheel.js';

export default var MouseResize = {

	resize_modes : {
		pedcreate: ModeTracker.modes.pedcreate,
		haploview: ModeTracker.modes.haploview,
	},

	_prevwheelstate : 0,
	_scale : 1,

	_wheelHandler: function(event){

		var delta = event.detail;
		if (delta === 0){
			delta = (event.deltaY > 0)?-0.1:0.1;
		}

		var wheelstatechanged = false;

		if ( (delta > 0 && MouseResize._prevwheelstate < 0)
		  || (delta < 0 && MouseResize._prevwheelstate > 0))
		{
			wheelstatechanged = true;
		}

		if (!wheelstatechanged){
			let new_scale = main_layer.getScale().x + delta;
			if (new_scale < 0.1){ new_scale = 0.1;}

			main_layer.setScale({
				x : new_scale,
				y : new_scale
			});
			utility.notify("Scale", new_scale.toFixed(1))
			main_layer.draw();
		}
		MouseResize._prevwheelstate = delta
	},

	on : function(handler)
	{
		MouseWheel.on(  MouseResize._wheelHandler );
		stage.setDraggable(true)
	},

	off: function(handler)
	{
		MouseWheel.off( MouseResize._wheelHandler );
		stage.setDraggable(false)
	}
}
