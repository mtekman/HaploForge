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
	__tmptasks : [],        // holds each layer of up and down tasks, pops/pushes each 

	__dn_tasks : {},  // keydn --> function()
	__up_tasks : {},    // keyup --> function()


	// -- Layer handling

	/** Store previous config and override if neccesary, restoring on layerOff **/	
	layerOn(name, replace = true){
		Keyboard.__beginListen();

		Keyboard.__tmptasks.push([ name, Keyboard.__dn_tasks, Keyboard.__up_tasks ])

		if (replace){
			Keyboard.__dn_tasks = {};
			Keyboard.__up_tasks = {};
		}
	},

	layerOff(){
		if (Keyboard.__tmptasks.length == 0){
			console.trace("No layer to pop");
			Keyboard.__endListen(); //No tasks to process
			return -1;
		}

		var dnup_tasks = Keyboard.__tmptasks.pop();
		Keyboard.__dn_tasks = dnup_tasks[1];
		Keyboard.__up_tasks = dnup_tasks[2];
	},

	__prevlistenstate: null,

	pause(){
		Keyboard.__prevlistenstate = Keyboard.__listening;
		Keyboard.__endListen();
	},
	
	unpause(){
		if (Keyboard.__prevlistenstate){
			Keyboard.__beginListen();
		}
		Keyboard.__prevlistenstate = null;
	},




	// Private
	__begin(){
		console.trace("begin");
		document.addEventListener("keydown", Keyboard.__processKeyDown, false);
		document.addEventListener("keyup", Keyboard.__processKeyUp, false);
	},

	__end(){
		console.trace("end");
		document.removeEventListener("keydown", Keyboard.__processKeyDown, false);
		document.removeEventListener("keyup", Keyboard.__processKeyUp, false);
	},

	__beginListen(){
		if (!Keyboard.__listening){
			Keyboard.__begin();
			Keyboard.__listening = true;
		}
	},

	__endListen(){
		if (Keyboard.__listening){
			Keyboard.__end();
			Keyboard.__listening = false;
		}
	},


	__processKeyDown(event){
		Keyboard.__map[event.key] = true;

		console.log(event.key);

		if (event.key in Keyboard.__dn_tasks){
			Keyboard.__dn_tasks[event.key]();
		}
	},

	__processKeyUp(event){
		Keyboard.__map[event.key] = false;

		if (event.key in Keyboard.__up_tasks){
			Keyboard.__up_tasks[event.key]();
		}
	},




	//  -- Key tasks
	addKeyPressTask(key, func, modifier_key = null){

		if (key in Keyboard.__dn_tasks){
			throw new Error("This will override the down AND up tasks for "+ key);
		}

		Keyboard.__dn_tasks[key] = function(){
			func.pressed = true;
		};

		Keyboard.__up_tasks[key] = function(){

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
		if (key in Keyboard.__dn_tasks){
			delete Keyboard.__dn_tasks[key];
			delete Keyboard.__up_tasks[key];
			return 0;
		}
		throw new Error(key + " not in down tasks (or up tasks)?");
	},

	addKeyUpTask(key, func){
		if (key in Keyboard.__up_tasks){
			throw new Error("This will override the up task for "+key);
		}
		Keyboard.__up_tasks[key] = func;
	},

	removeKeyUpTask(key){
		if (key in Keyboard.__up_tasks){
			delete Keyboard.__up_tasks[key];
			return 0;
		}
		throw new Error(key+" not in keyup tasks");
	},


	addKeyDownTask(key, func){
		if (key in Keyboard.__dn_tasks){
			throw new Error("This will override the down task for "+key);
		}
		Keyboard.__dn_tasks[key] = func;
	},

	removeKeyDownTask(key){
		if (key in Keyboard.__dn_tasks){
			delete Keyboard.__dn_tasks[key];
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