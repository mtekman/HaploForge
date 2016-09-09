/*Wrapper for selection tools and general button
  -- No need to call either directly 
*/

var ButtonModes = {

	__modespopulated: false,

	__validmodes: {
/*		"setToPedCreate": true,        	/* Pedigree Creation View */
/*		"setToHaploView": true,           /* HaploMode Visualization Mode */
		"setToSelectionMode": true, 	    /* Selection View */
		"setToComparisonMode": true,     	/* Side-by-Side Haploblock mode: Align, Find Hom, Range, Marker */
		"setToHomologySelection": true,   /* From comparison mode, the buttons showed during homology selection */
		"setToHomologyMode": true         /* Plot types */
	},

	__switchMode: function(funcname){

		console.log("ButtonMode", funcname)

		ButtonModes.__preamble();
		
		BottomButtons.modes[funcname]();
		ToolButtons.modes[funcname]();
	},
	
	__preamble: function(){
		if (!ButtonModes.__modespopulated){
			for (var mode in ButtonModes.__validmodes)
			{
				ButtonModes[mode] = ButtonModes.__switchMode.bind(this, mode);
			}
			ButtonModes.__modespopulated = true
		}
		Keyboard.endListen();
	},

	/* Switch mode has to be called at least once, keep these functions here */
	setToPedCreate(){
		ButtonModes.__switchMode(arguments.callee.name)
		Keyboard.beginListen();
	},

	setToHaploView(){
		ButtonModes.__switchMode(arguments.callee.name)
		Keyboard.beginListen();
	},
}



