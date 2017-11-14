import BottomButtons from '/JS/cssfuncs/buttonmodes/sub_bottom.js';
import ToolButtons from '/JS/cssfuncs/buttonmodes/sub_tools.js';
/*Wrapper for selection tools and general button
  -- No need to call either directly
*/

export default var ButtonModes = {

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

	makeToolsToggleButton(from, message, shortcut_text, callback)
	{
		var splitter = shortcut_text.split('|'),
			shortcut = splitter[0],
			text = (" (  " + shortcut + "  ) " + splitter[1]) || (" (  " + shortcut + "  ) ");


		var button = ButtonModes.__makeButton(message, text);
			button.prevstate = null;

		function newcallback(){
//			console.log(button,"clicked");
			if (button.prevstate === null){
				button.prevstate = [button.style.background, button.style.color];
				button.style.background = 'black'
				button.style.color = 'white'
			}
			else {
				button.style.background = button.prevstate[0];
				button.style.color = button.prevstate[1];
				button.prevstate = null;
			}
			callback();
		}

		ButtonModes.addKeyboardShortcut( from, shortcut, button.onclick)
		button.onclick = newcallback.bind(button);

		return button;
	},

	makeToolsButton: function(from, message, shortcut_text, callback)
	{
		var splitter = shortcut_text.split('|'),
			shortcut = splitter[0],
			text = (" (  " + shortcut + "  ) " + splitter[1]) || (" (  " + shortcut + "  ) ");

		ButtonModes.addKeyboardShortcut( from , shortcut, callback)

		return ButtonModes.__makeButton(message, text, callback)
	},


	__makeButton: function(message, title_text, callback){
		var butt = document.createElement("button");

		butt.title = title_text;
		butt.innerHTML = message;
		butt.onclick = callback;

		return butt;
	},


	addKeyboardShortcut(caller, keycombo, func){
		// Key and modifier
		//console.log(keycombo)

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

		if (!ButtonModes.__modespopulated){
			for (var mode in ButtonModes.__validmodes)
			{
				ButtonModes[mode] = ButtonModes.__switchMode.bind(this, mode);
			}
			ButtonModes.__modespopulated = true
		}

		ButtonModes.removeKeyboardShortcuts("general");
		ButtonModes.removeKeyboardShortcuts("sidetool");
		Keyboard.layerOff();
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
