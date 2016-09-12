

class FileFormat {

	constructor(haplo,
		map = null ,
		ped = null ,
		descent = null,
		afterCallback = null)
	{

		this.descentfile = (descent === null)?0:document.getElementById(descent.id).files[0] || 0;
		this.haplofile = (haplo === null)?0:document.getElementById(haplo.id).files[0] || 0;
		this.mapfile = (map === null)?0:document.getElementById(map.id).files[0] || 0;
		this.pedfile = (ped === null)?0:document.getElementById(ped.id).files[0] || 0;

		if (haplo === null){
			throw new Error("No haplo file given")
		}
		FileFormat.__begFuncs();


		var that = this

		FileFormat.readFile(this.haplofile, function(haplo_text){
			// Read pedfile first if given
			if (that.pedfile !== 0){
				FileFormat.readFile(that.pedfile, ped.process);
			}

			// Descent graph should be set before haplotypes are parsed	
			if (that.descentfile !== 0){
				FileFormat.readFile(that.descentfile, descent.process);
			}

			haplo.process(haplo_text);

			// Map depends on pedigree data
			if (that.mapfile !== 0){
				FileFormat.readFile(that.mapfile, map.process);
			}
			else if ("nonexistent" in map){
				map.nonexistent();
			}

			//Callback
			if (afterCallback !== null){
				afterCallback();
			} else {
				// Assume Haplo mode is final callback
				HaploPedProps.init();
			}

			// They all call this, but it should not really be here.
			FileFormat.__endFuncs();
		})
	}


	static readFile(file, callback){
	    var fr = new FileReader();

	    fr.onloadend = function(e){
	    	callback(e.target.result);
	    };

	    fr.readAsText(file);
	}

	static __begFuncs(){
		// Flush all maps
		MainButtonActions.preamble();
		MainPageHandler.haplomodeload();
	}

	static __endFuncs(){
		graphInitPos(nodeSize + 10, grid_rezY);

		assignHGroups();
		MarkerData.padMarkerMap();

		populateIndexDataList();
	}
}