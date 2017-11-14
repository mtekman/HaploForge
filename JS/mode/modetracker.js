import MouseResize from '/JS/iofuncs/mouseresize.js';
import { error } from '/JS/globals.js';

// Set by cssfuncs/buttonmodes/general.js
// -- but good to keep it here

export default var ModeTracker = {

	currentMode : null,

	modes : {

		pedcreate: 0,
		haploview: 1,
		selection: 2,
		comparison: 3,
		homselection: 4,
		homology: 5
	},

	setMode(mode)
	{
		if (mode in ModeTracker.modes){
			ModeTracker.currentMode = ModeTracker.modes[mode];

			if (mode in MouseResize.resize_modes){
				MouseResize.on();
			}
			else {
				MouseResize.off();
			}

			return 0;
		}
		console.log("mode", mode);
		error("invalid mode");
	}
}
