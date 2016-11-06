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

	__shortcuts : {},

	addButton: function(message, title_text, callback){
		var button = document.createElement("button");

		button.title = title_text;
		button.innerHTML = message;
		button.onclick = callback;

		return button;
	},


	addKeyboardShortcut(caller, keycombo, func){
		// Key and modifier
		console.log(keycombo)

		var alt_key = keycombo.split('+'),
			key = null,
			alt = null;

		if (alt_key.length == 2){
			alt = alt_key[0];
			key = alt_key[1];
			
			if (alt === "Ctrl"){
				alt = "Control"
			}
		}
		else {
			key = alt_key[0]
		}

		if (key.length === 1){
			key = key.toLowerCase();
		}

		if (!(caller in ButtonModes.__shortcuts)){
			ButtonModes.__shortcuts[caller] = {};
		}

		ButtonModes.__shortcuts[caller][key] = true;
		Keyboard.addKeyPressTask(key, func, alt);
	},

	removeKeyboardShortcuts(caller){
		for (var k in ButtonModes.__shortcuts[caller]){
			Keyboard.removeKeyPressTask(k);
		}
		ButtonModes.__shortcuts[caller] = {}; //reset
	},


	__switchMode: function(funcname){
		console.log("ButtonMode", funcname);

		ButtonModes.__preamble(funcname);

		BottomButtons.modes[funcname]();
		ToolButtons.modes[funcname]();

	},
	
	__preamble: function(nameOfMode){
		ButtonModes.removeKeyboardShortcuts("general");
		ButtonModes.removeKeyboardShortcuts("sidetool");
		Keyboard.layerOff();

		if (!ButtonModes.__modespopulated){
			for (var mode in ButtonModes.__validmodes)
			{
				ButtonModes[mode] = ButtonModes.__switchMode.bind(this, mode);
			}
			ButtonModes.__modespopulated = true
		}
		Keyboard.layerOn(nameOfMode);
	},

	/* Switch mode has to be called at least once, keep these functions here */
	setToPedCreate(){
		ButtonModes.__switchMode(arguments.callee.name)
	},

	setToHaploView(){
		ButtonModes.__switchMode(arguments.callee.name)
	},
}



