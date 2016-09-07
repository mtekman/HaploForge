//Keyboard

var Keyboard = {
	
	__map : {
		"Shift": false
	},
	__listening: false,


	beginListen(){
		if (!Keyboard.__listening){
			document.addEventListener("keydown", Keyboard.__processKeyDown, false);
			document.addEventListener("keyup", Keyboard.__processKeyUp, false);
			console.log("keyboard listening")

			Keyboard.__listening = true;
		}
	},

	endListen(){
		if (Keyboard.__listening){
			document.removeEventListener("keydown", Keyboard.__processKeyDown, false);
			document.removeEventListener("keyup", Keyboard.__processKeyUp, false);

			Keyboard.__listening = false;
			console.log("keyboard stopped")
		}
	},

	__processKeyDown(event){
		Keyboard.__map[event.key] = true;
	},

	__processKeyUp(event){
		Keyboard.__map[event.key] = false;
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
	}

}