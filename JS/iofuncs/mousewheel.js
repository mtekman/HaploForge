export var MouseWheel = {

	__mousewheellistener_on : false,
	__lasthandler : null,

	_addMouseWheel: function(handler)
	{
		if (document.addEventListener) {
        	document.addEventListener("mousewheel", handler, false); //IE9, Chrome, Safari, Oper
        	document.addEventListener("wheel", handler, false); //Firefox
    	} else {
        	document.attachEvent("onmousewheel", handler); //IE 6/7/8
    	}
		MouseWheel.__mousewheellistener_on = true;
		MouseWheel.__lasthandler = handler;
	},

	_removeMouseWheel: function(handler)
	{
		if (document.addEventListener) {
        	document.removeEventListener("mousewheel", handler, false); //IE9, Chrome, Safari, Oper
        	document.removeEventListener("wheel", handler, false); //Firefox
    	} else {
        	document.detachEvent("onmousewheel", handler); //IE 6/7/8
    	}
		MouseWheel.__mousewheellistener_on = false;
	},

	on : function(handler){
		if (MouseWheel.__mousewheellistener_on){
			console.log("Listener already active, detaching last handler and replacing with new");
			MouseWheel._removeMouseWheel( MouseWheel.__lasthandler );
		}
		MouseWheel._addMouseWheel( handler );
	},

	off : function(handler){
		if (MouseWheel.__mousewheellistener_on){
			MouseWheel._removeMouseWheel( handler );
			console.log("turning off mouse");
			return 0;
		}
		console.log("already off");
	}
}
