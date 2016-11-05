
var MainButtonActions  = {

	_temphaploload: null,

	preamble: function(){
		Keyboard.layerOff();

		makeStage();
		init.clearMaps();

		Keyboard.layerOn();
	},

	fileUpload: fileSelector.init,

	loadHaploFromStorage: function()
	{
		FileFormat.__begFuncs();
		
		var hap_data = localStorage.getItem( localStor.hap_save );

		SerialParse.All.import( hap_data );
		HaploPedProps.init();
		
		FileFormat.__endFuncs(null);  // :=null  ensures that HGroups aren't reassigned.
	},


	loadPedFromStorage: function(haplotransfer = false) {
		MainButtonActions.preamble();
		MainPageHandler.createpedmode();
		
		var ped_data, ped_type;

		if (!haplotransfer){
			ped_data = localStorage.getItem( localStor.ped_save );
			Pedfile.import(ped_data);
		} else {
			ped_data = localStorage.getItem( localStor.transfer );
			//Do.Something.Else();
		}

		init.pedcreate();
	},

	savePedToStorage: function() {

		var ped_to_string = Pedfile.export(true); 
		/*always store graphics for local, only export has no graphics option*/

		localStorage.setItem( localStor.ped_save, ped_to_string );
		localStorage.setItem( localStor.ped_type, FORMAT.PEDFILE);

		utility.notify("Pedigree Saved","...");
	},

	saveHaploToStorage: function(){
		//Save to local storage
		localStorage.setItem(localStor.hap_save, SerialParse.All.export() )
//		localStorage.setItem(localStor.hap_type, MainButtonActions.fileType)

		utility.notify("Haplo File Saved","...");		
	},

	exitToMenu: function(){

		if (MainButtonActions.fileType === FORMAT.PEDFILE){
			var changeDetected = Pedfile.pedigreeChanged();

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
	}
}