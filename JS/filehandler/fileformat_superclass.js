
function debugSaveHaplo(){
	localStorage.setItem("TEST", MainButtonActions._temphaploload);
}

class FileFormat {

    addReadJob(job) {
	    console.log("Queuing:", job.file.name);

    	if (this.firstjob === undefined) {
      		this.firstjob = function(){};
    	}
	    // Store previous job 
    	var lastjob = this.firstjob;

    	// Create new job that passes the previous job
    	// as a readbeforefunc argument to new job.
    	this.firstjob = function(finish) {
      		lastjob();
      		FileFormat.readFile(job.file, job.task, finish);
    		console.log("Processing:", job.file.name);
    	}
  	}


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
		if (this.pedfile !== 0){
			this.addReadJob({file:this.pedfile, task:ped.process});
		}


		this.addReadJob({
			file: this.haplofile,
			task: function(haplo_text){
				MainButtonActions._temphaploload = haplo_text; // for transferring from haplo to pedcreate
				debugger;
				haplo.process(haplo_text);


				// Sometimes the haplo file has RS data and this step is not neccesary.
				if (!haplo.hasMarkerNames){
					// Enumerate map based on number of locus
					FileFormat.enumerateMarkers();
				}
			}
		});

		// Descent graph 
		if (this.descentfile !== 0){
			useresolver = descent.resolver_mode;
			this.addReadJob({file:this.descentfile, task: descent.process});
		}
		// The descent graph for simwalk is within the haplo data
		else if (haplo.useDescent !== undefined){
			if (haplo.useDescent){
				useresolver = haplo.resolver_mode;
			}
		}

		// Map depends on pedigree data
		if (this.mapfile !== 0){
			this.addReadJob({file:that.mapfile, task:function(text){map.process(text);debugger;}});
		}

		// Process all jobs
		this.firstjob(
			// Add a final finishing function after all the files are processed
			function finalFinishFunc(){

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
		);

	}


	static readFile(file, callback, finishfunc = 0){
	    var fr = new FileReader();

	    fr.onloadend = function(e){
	    	callback(e.target.result);

	    	if (finishfunc !== 0){ finishfunc();}
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

		var markers = [];

		for (var m=0; m < allele_length; m++){
			markers.push(String("          " + m).slice(-10));
		}

		MarkerData.addMarkers( markers );
	}
}