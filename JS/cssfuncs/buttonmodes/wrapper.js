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

		funcname = funcname || arguments

		console.log("ButtonMode", funcname)

		ButtonModes.__preamble();
		
		BottomButtons.modes[funcname]();
		ToolButtons.modes[funcname]();
	},
	
	__preamble: function(){
		if (!ButtonModes.__modespopulated){
			for (var mode in ButtonModes.__validmodes)
			{
				ButtonModes[mode] = function(){
					arguments.callee.name = mode;

					ButtonModes.__switchMode(mode)
				};
			}
			ButtonModes.__modespopulated = true
		}
		Keyboard.endListen();
	},

	/* Switch mode has to be called at least once, keep these functions here */
	setToPedCreate: function(){
		ButtonModes.__switchMode(arguments.callee.name)
		Keyboard.beginListen();
	},

	setToHaploView: function(){		
		ButtonModes.__switchMode(arguments.callee.name)
		Keyboard.beginListen();
	},
}

var GeneralWrapper = {


	__modespopulated: false,

	__validmodes: {		// All 3 of these
		spoonFunc: 1,   //  functions exist
		knifeFunc: 1,   //  in Library1 and
		 forkFunc: 1    //  Library2
	},

	__switchMode: function(funcname){

		if (funcname in GeneralWrapper.__validmodes){
			console.log("calling function", funcname)

			GeneralWrapper.__preamble()

			Library1[ funcname ](); // Call mode in Library1
			Library2[ funcname ](); // Call mode in Library2
		}
	},

	/* Attach valid modes to General Wrapper at runtime */
	__preamble: function(){
		if (!GeneralWrapper.__modespopulated)
		{
			for (var mode in GeneralWrapper.__validmodes)
			{
				GeneralWrapper[mode] = function(){
					GeneralWrapper.__switchMode(mode)
				};
			}

			GeneralWrapper.__modespopulated = true
		}

		GeneralWrapper.__otherprestuff();
	},


	__otherprestuff: function(){
		// Stuff
	},

	funcThatAlwaysGetsCalled: function(){
		GeneralWrapper.__switchMode("forkFunc");
	}

}

var Library1 = { 
	 forkFunc(){console.log("Lib1","fork")},
	spoonFunc(){console.log("Lib1","spoon")},
	knifeFunc(){console.log("Lib1","knife")}
}

var Library2 = { 
	 forkFunc(){console.log("Lib2","FORK")},
	spoonFunc(){console.log("Lib2","SPOON")},
	knifeFunc(){console.log("Lib2","KNIFE")}
}






