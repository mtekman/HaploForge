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

	dn_tasks : {},  // keydn --> function()
	up_tasks : {},    // keyup --> function()

	__begin(){
		document.addEventListener("keydown", Keyboard.__processKeyDown, false);
		document.addEventListener("keyup", Keyboard.__processKeyUp, false);
	},

	__end(){
		document.removeEventListener("keydown", Keyboard.__processKeyDown, false);
		document.removeEventListener("keyup", Keyboard.__processKeyUp, false);
	},

	beginListen(){
		if (!Keyboard.__listening){
			Keyboard.__begin();
		}
		Keyboard.__listening = true;
	},

	endListen(){
		if (Keyboard.__listening){
			Keyboard.__end();
			Keyboard.__listening = true;
		}
	},

	pause(except_func = null){
		Keyboard.__pause_state = Keyboard.__listening

		if (except_func !== null){
			Keyboard.__tmptasks = [Keyboard.dn_tasks, Keyboard.up_tasks];
			Keyboard.dn_tasks = {};
			Keyboard.up_tasks = {};

			except_func();
		}
		else {
			Keyboard.endListen();		
		}
	},

	unpause(){

		// Unload except_func layer if required
		if (Keyboard.__tmptasks.length > 0){
			Keyboard.dn_tasks = Keyboard.__tmptasks[0];
			Keyboard.up_tasks = Keyboard.__tmptasks[1];
			Keyboard.__tmptasks = [];
		}

		if (Keyboard.__pause_state){
			Keyboard.beginListen();
		}
		Keyboard.__pause_state = null;
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

}