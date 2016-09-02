
var MainButtonActions  = {

	preamble: function(){
		makeStage();
		PersistData.clearMaps();
	},

	processHaploFile: function() {
	    var file = document.getElementById("haploupload").files[0];
	    var lr = new FileReader();

	    lr.onloadend = function(e){
	    	MainButtonActions.preamble();
			MainPageHandler.haplomodeload();

			MainButtonActions.processinput(e.target.result) /* type unknown at this point */
	    };

	    lr.readAsText(file);
	},

	loadHaploFromStorage: function() {
		MainButtonActions.preamble();
		MainPageHandler.haplomodeload();

		var hap_data = localStorage.getItem( localStor.hap_save ),
			hap_type = localStorage.getItem( localStor.hap_type );

		MainButtonActions.processinput(hap_data, hap_type);
	},

	loadPedFromStorage: function() {
		MainButtonActions.preamble();
		MainPageHandler.createpedmode();
		
		var ped_data = localStorage.getItem( localStor.ped_save ),
			ped_type = localStorage.getItem( localStor.ped_type );

		MainButtonActions.processinput(ped_data, ped_type);
	},

	savePedToStorage: function() {

		var ped_to_string = PersistData.toPedfileString(true); 
		/*always store graphics for local, only export has no graphics option*/

		localStorage.setItem( localStor.ped_save, ped_to_string );
		localStorage.setItem( localStor.ped_type, FORMAT.PEDFILE);

		utility.notify("Pedigree Saved","...");
	},

	saveHaploToStorage: function(){
		//Save to local storage
		localStorage.setItem(localStor.hap_save, e.target.result)
		localStorage.setItem(localStor.hap_type, MainButtonActions.fileType)

		utility.notify("Haplo File Saved","...");		
	},

	exitToMenu: function(){

		if (MainButtonActions.fileType === FORMAT.PEDFILE){
			var changeDetected = PersistData.pedigreeChanged();

			if (changeDetected){
				utility.yesnoprompt("Pedigree Modified", "Save changes before exit?",
					"Yes", function(){
			 			MainButtonActions.savePedToStorage();
			 			MainPageHandler.defaultload();
			 		},
			 		"No", function(){
			 			MainPageHandler.defaultload();	
				 	}
				 );
			}
			else{
				MainPageHandler.defaultload();
			}
		}
		// Haplo Types are automatically saved and loaded
		else{
			MainPageHandler.defaultload();
		}
	},


	createNewPed: function() {
		MainButtonActions.preamble();
		MainPageHandler.createpedmode();

/*		var d = document.getElementById('pedcreate_views');
		d.style.position = "absolute";
		d.style.zIndex = 122;
		d.style.display = "";*/
	
		finishDraw(); // Initialize stage
	},

	processinput: function(data, type = null){
		var pi = new ProcessInput(data, type);
		MainButtonActions.fileType = (type === null)?pi.type:type;
		init.haploview();
		pi = null; /* Force early GC */
	},


	toggleTransitions: function(checked){
		userOpts.allowTransitions = !checked;
	}
}