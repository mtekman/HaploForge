
class MainButtonActions {

	static preamble(){
		makeStage();
	}

	static processHaploFile() {
	    var file = document.getElementById("haploupload").files[0];
	    var lr = new FileReader();

	    lr.onloadend = function(e){
	    	MainButtonActions.preamble();
			MainPageHandler.haplomodeload();

			MainButtonActions.processinput(e.target.result) /* type unknown at this point */

			//Save to local storage
			localStorage.setItem(localStor.hap_save, e.target.result)
			localStorage.setItem(localStor.hap_type, MainButtonActions.fileType)
			console.log("SAVED HAPLO")
	    };

	    lr.readAsText(file);
	}

	static loadHaploFromStorage() {
		MainButtonActions.preamble();
		MainPageHandler.haplomodeload();

		var hap_data = localStorage.getItem( localStor.hap_save ),
			hap_type = localStorage.getItem( localStor.hap_type );

		MainButtonActions.processinput(hap_data, hap_type);
	}

	static loadPedFromStorage() {
		MainButtonActions.preamble();
		MainPageHandler.createpedmode();
		
		var ped_data = localStorage.getItem( localStor.ped_save ),
			ped_type = localStorage.getItem( localStor.ped_type );

		MainButtonActions.processinput(ped_data, ped_type);
	}


	static savePedToStorage() {

		var ped_to_string = PersistData.toPedfileString(true); /*store graphics*/

		localStorage.setItem( localStor.ped_save, ped_to_string );
		localStorage.setItem( localStor.ped_type, "pedfile");

		utility.notify("Pedigree Saved","...");
	}

	static exitToMenu(){

		if (MainButtonActions.fileType === "Pedigree"){
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
	}


	static createNewPed() {
		MainButtonActions.preamble();
		MainPageHandler.createpedmode();

/*		var d = document.getElementById('pedcreate_views');
		d.style.position = "absolute";
		d.style.zIndex = 122;
		d.style.display = "";*/
	
		finishDraw(); // Initialize stage
	}

	static processinput(data, type = null){
		var pi = new ProcessInput(data, type);
		MainButtonActions.fileType = (type === null)?pi.type:type;
		init();
		pi = null; /* Force early GC */
	}
}