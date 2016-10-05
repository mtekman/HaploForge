
function debugSaveHaplo(){
	localStorage.setItem("TEST", MainButtonActions._temphaploload);
}

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

		var that = this,
			useresolver = AssignHGroups.resolvers.ASTAR;

			// I NEED TO CHAIN THESE TOGETHER SOMEHOW

		// Read pedfile first if given
		if (that.pedfile !== 0){
			FileFormat.readFile(that.pedfile, ped.process);
		}


		FileFormat.readFile(this.haplofile, function(haplo_text){
			MainButtonActions._temphaploload = haplo_text; // for debugging
			haplo.process(haplo_text);
		});

		// Descent graph 
		if (that.descentfile !== 0){
			useresolver = descent.resolver_mode;			
			FileFormat.readFile(that.descentfile, descent.process);
		}
		// The descent graph for simwalk is within the haplo data
		else if (haplo.useDescent !== undefined){
			if (haplo.useDescent){
				useresolver = haplo.resolver_mode;
			}
		}


		// Sometimes the haplo file has RS data and this
		// step is not neccesary.
		if (!haplo.hasMarkerNames){
			// Enumerate map based on number of locus
			FileFormat.enumerateMarkers();
		}

		// Map depends on pedigree data
		if (that.mapfile !== 0){
			FileFormat.readFile(that.mapfile, map.process);
		}

		//Callback
		if (afterCallback !== null){
			afterCallback();
		} else {
			// Assume Haplo mode is final callback
			HaploPedProps.init(function(){
				if (haplo.inferGenders){
					familyMapOps.inferGenders();
				}
			});
		}

		// No descent file performs Hgroup assignment
		FileFormat.__endFuncs(useresolver);
	}


	static readFile(file, callback, finishfunc = 0){
	    var fr = new FileReader();

	    fr.onloadend = function(e){
	    	callback(e.target.result);

	    	//For sequential ops
	    	if (finishfunc !==0){
	    		finishfunc();
	    	}

	    };

	    fr.readAsText(file);
	}

	static __begFuncs(){
		// Flush all maps
		MainButtonActions.preamble();
		MainPageHandler.haplomodeload();
	}

	// If useresolver === null, we ignore assignHGroups
	//   altogether (useful when loading a prior analysis)
	static __endFuncs(descentmode = 0){
		
		graphInitPos(nodeSize + 10, grid_rezY);

		if (descentmode === null){
			console.log("Resolve: Load From Storage");
		} else {
			AssignHGroups.init(descentmode);
		}

		MarkerData.padMarkerMap();
	}


	static enumerateMarkers(){
		// No map -- enumerate markers off some random perc
		var randomperc = familyMapOps.getRandomPerc(),
			allele_length = randomperc.haplo_data[0].data_array.length;

		for (var m=0; m < allele_length; m++){
			MarkerData.rs_array.push(String("          " + m).slice(-10));
		}	
	}
}