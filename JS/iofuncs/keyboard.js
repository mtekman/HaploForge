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
		var dnup_tasks = Keyboard.__tmptasks.pop();

		if (dnup_tasks === undefined){
			console.log("nothing to pop");
			return -1;
		}

		Keyboard.__dn_tasks = dnup_tasks[1];
		Keyboard.__up_tasks = dnup_tasks[2];

		if (Keyboard.__tmptasks.length == 0){
			Keyboard.__endListen(); //No tasks to process
		}
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
	__begin(func1 = null, func2 = null){
		if (func1 === null){
			func1 = Keyboard.__processKeyDown;
			func2 = Keyboard.__processKeyUp;
		}

		console.trace("begin");
		document.addEventListener("keydown", func1, false);
		document.addEventListener("keyup",   func2, false);
	},

	__end(func1 = null, func2 = null){
		if (func1 === null){
			func1 = Keyboard.__processKeyDown;
			func2 = Keyboard.__processKeyUp;
		}

		console.trace("end");
		document.removeEventListener("keydown", func1, false);
		document.removeEventListener("keyup",   func2, false);
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
		console.warn(key,"not in down tasks (or up tasks)?");
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
		console.warn(key, "not in keyup tasks");
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

	noKeysPressed(){
		for (var key in Keyboard.__map){
			if (Keyboard.__map[key]){
				console.log(key);
				return false;
			}
		}
		return true;
	},


	setCombo(callback){
		Keyboard.pause()

		function upper(){
			if(Keyboard.noKeysPressed){
				callback(Keyboard.__tempcombo)
			}
			Keyboard.__end(Keyboard.__getCombo, upper);
			Keyboard.unpause();
		}

		Keyboard.__begin(Keyboard.__getCombo, upper);
	},

	__getCombo(evt){

		var key = null;

		switch(evt.key){
			case "Control":
			case "Shift":
			case "Alt": key = '?'; break;
			default: key = evt.key; break
		}

		var ctrl = evt.ctrlKey,
			shift = evt.shiftKey,
			alt = evt.altKey;

		if (key.length === 1){
			key = key.toUpperCase();
		}

		Keyboard.__tempcombo = (ctrl?"Ctrl+":"")+(alt?"Alt+":"")+(shift?"Shift+":"")+key;

		// Stop browser events
		if (window.event){
			evt.preventDefault();
			evt.stopPropagation();
		}
	}
}