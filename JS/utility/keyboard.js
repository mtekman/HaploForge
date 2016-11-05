//Keyboard

var Keyboard = {
	
	__map : {
		"Control" : false,
		"Shift": false,
		"ArrowDown": false,
		"ArrowUp" : false,
		"PageDown" : false,
		"PageUp" : false
	},

	__listening: false, 

	__pause_state: null,	// Pausing is useful for input entering operations.
	__tmptasks : [], // temporary layer for holding up and down tasks during pauses.

	__dn_tasks : {},  // keydn --> function()
	__up_tasks : {},    // keyup --> function()


	// -- Layer handling

	/** Store previous config and override if neccesary, restoring on layerOff **/	
	layerOn(newfuncs, replace = false){
		Keyboard.__tmptasks.push( [Keyboard.__dn_tasks, Keyboard.__up_tasks] )

		if (replace){
			Keyboard.__dn_tasks = {};
			Keyboard.__up_tasks = {};
		}
		newfuncs();
	},

	layerOff(){
		if (Keyboard.__tmptasks.length == 0){
			console.log("No layer to pop");
			return -1;
		}

		var dnup_tasks = Keyboard.__tmptasks.pop();
		Keyboard.__dn_tasks = dnup_tasks[0];
		Keyboard.__up_tasks = dnup_tasks[1];
	},

	pause(){Keyboard.__endListen();},
	unpause(){Keyboard.__beginListen();},


	//  -- Key tasks
	addKeyPressTask(key, func, modifier_key = null){

		if (key in Keyboard.dn_tasks){
			throw new Error("This will override the down AND up tasks for "+ key);
		}

		Keyboard.dn_tasks[key] = function(){
			func.pressed = true;
		};

		Keyboard.up_tasks[key] = function(){

			if (modifier_key !== null){
				if (!(Keyboard.isPressed( modifier_key ))){
					return -1;
				}
			}

			if (func.pressed){
				func();
			}
			func.pressed = false;
		};
	},

	removeKeyPressTask(key){
		if (key in Keyboard.dn_tasks){
			delete Keyboard.dn_tasks[key];
			delete Keyboard.up_tasks[key];
			return 0;
		}
		throw new Error(key + " not in down tasks (or up tasks)?");
	},

	addKeyUpTask(key, func){
		if (key in Keyboard.up_tasks){
			throw new Error("This will override the up task for "+key);
		}
		Keyboard.up_tasks[key] = func;
	},

	removeKeyUpTask(key){
		if (key in Keyboard.up_tasks){
			delete Keyboard.up_tasks[key];
			return 0;
		}
		throw new Error(key+" not in keyup tasks");
	},


	addKeyDownTask(key, func){
		if (key in Keyboard.dn_tasks){
			throw new Error("This will override the down task for "+key);
		}
		Keyboard.dn_tasks[key] = func;
	},

	removeKeyDownTask(key){
		if (key in Keyboard.dn_tasks){
			delete Keyboard.dn_tasks[key];
			return 0;
		}
		console.error(key+" not in keydown tasks");
	},

	isPressed(key){
		if (key in Keyboard.__map){
			return Keyboard.__map[key];
		}
		// otherwise insert it and set false
		Keyboard.__map[key] = false;
		return false
	},

	isShiftDown(){
		return Keyboard.isPressed("Shift");
	},


	isCtrlDown(){
		return Keyboard.isPressed("Control");
	},	


	// Private
	__begin(){
		document.addEventListener("keydown", Keyboard.__processKeyDown, false);
		document.addEventListener("keyup", Keyboard.__processKeyUp, false);
	},

	__end(){
		document.removeEventListener("keydown", Keyboard.__processKeyDown, false);
		document.removeEventListener("keyup", Keyboard.__processKeyUp, false);
	},

	__beginListen(){
		if (!Keyboard.__listening){
			Keyboard.__begin();
		}
		Keyboard.__listening = true;
	},

	__endListen(){
		if (Keyboard.__listening){
			Keyboard.__end();
			Keyboard.__listening = true;
		}
	},


	__processKeyDown(event){
		Keyboard.__map[event.key] = true;

		console.log(event.key);

		if (event.key in Keyboard.dn_tasks){
			Keyboard.dn_tasks[event.key]();
		}
	},

	__processKeyUp(event){
		Keyboard.__map[event.key] = false;

		if (event.key in Keyboard.up_tasks){
			Keyboard.up_tasks[event.key]();
		}
	},



}