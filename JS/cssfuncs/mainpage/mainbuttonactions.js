import SerialParse from '/JS/iofuncs/serialparse.js';
import ModeTracker from '/JS/mode/modetracker.js';
import MainPageHandler from '/JS/cssfuncs/mainpage/mainpagehandler.js';
import Pedfile from '/JS/filehandler/formats/pedfile.js';
import fileSelector from '/JS/filehandler/boxselector.js';
import FileFormat from '/JS/filehandler/fileformat_superclass.js';

function reload(){
	location.reload()
}

export default var MainButtonActions  = {

	_temphaploload: null,

	preamble: function(){
		makeStage();
		init.clearMaps();
	},

	fileUpload: fileSelector.init,

	loadHaploFromStorage: function(hap_data = null)
	{
		FileFormat.__begFuncs();

		if (hap_data === null){
			hap_data = localStorage.getItem( localStor.hap_save );
		}

		// Still empty?
		if (hap_data === null){
			console.log("No haplo data saved");
			MainButtonActions.exitToMenu();
			return
		}

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
			console.log(ped_data);
			//Do.Something.Else();
		}

		init.pedcreate();
	},

	savePedToStorage: function() {

		var ped_to_string = Pedfile.export(true);
		if (ped_to_string === -1){
			return;
		}
		/*always store graphics for local, only export has no graphics option*/

		localStorage.setItem( localStor.ped_save, ped_to_string );
		localStorage.setItem( localStor.ped_type, localStor.ped_type);

		utility.notify("Pedigree Saved","...");
	},

	saveHaploToStorage: function(){
		//Save to local storage
		localStorage.setItem(localStor.hap_save, SerialParse.All.export() )
		utility.notify("Haplo File Saved","...");
	},

	exitToMenu: function(){

		if (ModeTracker.currentMode === ModeTracker.modes.pedcreate){
			var changeDetected = Pedfile.pedigreeChanged();

			if (changeDetected){
				utility.yesnoprompt("Pedigree Modified", "Save changes before exit?",
					"Yes", function(){
			 			MainButtonActions.savePedToStorage();
			 			//MainPageHandler.defaultload();
			 			reload();
			 		},
			 		"No", function(){
			 			MainPageHandler.defaultload();
				 	}
				 );
			}
			else{
				//MainPageHandler.defaultload();
				reload();
			}
		}
		// Haplo Types are automatically saved and loaded
		else{
			//MainPageHandler.defaultload();
			reload();
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
