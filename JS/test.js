var bb;

var Test = {

    Benchmark : {
    	run() {
    		var inbr_array = [0.1,0.9],
    			root_fndrs = [2,5,10],
    			max_gendrs = [5,7,10,12],
    			alle_sizes = [100,1000,10000,100000];

    		var bmarkkey = "benchmark_runs";

    		var run_map = {}

    		if (localStorage.getItem(bmarkkey)=== null){
    			localStorage.setItem(bmarkkey, JSON.stringify(run_map))
    		}

    		run_map = JSON.parse( localStorage.getItem(bmarkkey) );

    		for (var ia = 0; ia < inbr_array.length; ia++){
				for (var rf = 0; rf < root_fndrs.length; rf++){
					for (var mg = 0; mg < max_gendrs.length; mg++){
						for (var az = 0; az < alle_sizes.length; az++){

							var inbreed      = inbr_array[ia],
								root_founder = root_fndrs[rf],
								maxgen       = max_gendrs[mg],
								allele_size  = alle_sizes[az];

							var key = "benchmark= " + inbreed + " " + root_founder + " " + maxgen + " " + allele_size;

							if (!(key in run_map)){
								run_map[key] = { 
									passes:  0, 
									fails :  0, 
									record: []
								};
							}

							var val = run_map[key];

							var passes = val.passes,
								fails  = val.fails;

							if (passes > 5){continue;}
							// Some tests just dont render... skip
							if (fails  > 5){continue;}


							BenchMark.launch_with_props(root_founder, maxgen, allele_size, inbreed, false,

								function endFunc(timetree, numpeople, numinbredcouples, timerender){
						        	run_map[key].passes += 1
									run_map[key].record.push({
										time_tree: timetree,
										people: numpeople,
										inbredcouples: numinbredcouples,
										time_render: timerender
									});
                					console.log(key, "Rendered");

                					localStorage.setItem(bmarkkey, JSON.stringify(run_map))
                					setTimeout(function(){
                						location.reload(true);
                					},1000);

								},

        						function terminate(errors){
        							run_map[key].fails += 1
        							run_map[key].record.push({
        								error: errors
        							});
                					console.log(key, "Terminated");

                					localStorage.setItem(bmarkkey, JSON.stringify(run_map))
                					setTimeout(function(){
                						location.reload(true);
                					},1000);
                				}
        					);

							return 0; // run one test before a refresh
						}
					}
				}
    		}
    	},

    	start() {
			var key = "benchmark_runner";
    		
    		if (localStorage.getItem(key) === null){
    			Test.Benchmark.disable();
    		}

    		if (localStorage.getItem(key)){
    			Test.Benchmark.run();
    		}
    	},

    	enable() {
    		var key = "benchmark_runner";
    		localStorage.setItem(key, true)
    	},

    	disable() {
    		var key = "benchmark_runner";
    		localStorage.setItem(key, false)
    	}
    },
        
    

    Tutorial : {
	Main(){

	    var pages = [
		["Title1", "This is the text at the top that explains quickly", 
		 "This is the bottom text that rambles on and on about nothing in particular and most people think is a bit much to be honest", null],

		["Title2", "This is the text at the top that explains quickly", 
		 "This is the bottom text that rambles on and on about nothing in particular and most people think is a bit much to be honest", null, 
		 {enter:function(){console.log("page2 enter action")}, exit:function(){console.log("page2 exit action")}}],

		["Title3", "This is the text at the top that explains quickly", 
		 "This is the bottom text that rambles on and on about nothing in particular and most people think is a bit much to be honest", null],
	    ];

	    var pf = new Tutorial( pages, function exit(){
		console.log("Quit function")
	    } );
	},

	Buttons(){
	    userOpts.fancyGraphics = false;
	    MainButtonActions.loadHaploFromStorage();

	    setTimeout(function(){
		var tutbutt = document.getElementById('selection_tools').childNodes[3].childNodes[1].childNodes[0].cells[0].childNodes[0]
		bb =  new ButtonTutorial(tutbutt, "Go away", "Test this tdiasd andso", "right");				
	    },1000)
	}
    },


    GHM : {
	saveChrAndFlow(){
	    localStorage.setItem("GHMPED", debugGH.ped);
	    localStorage.setItem("GHMHAP", debugGH.haplo);
	    localStorage.setItem("GHMMAP", debugGH.map);
	},

	run(){
	    MainButtonActions.preamble();

	    setTimeout(function(){
		MainPageHandler.haplomodeload();

		setTimeout(function(){
		    userOpts.fancyGraphics = false;

		    var haplo_text = localStorage.getItem("GHMHAP");
		    var ped_text = localStorage.getItem("GHMPED");
		    var map_text   = localStorage.getItem("GHMMAP");

		    Genehunter.populateFamilyAndHaploMap(haplo_text);
		    Genehunter.populateMarkerMap(map_text);
		    
		    HaploPedProps.init();
		    FileFormat.__endFuncs( AssignHGroups.resolvers.FLOW );

		    setTimeout(function(){
			SelectionMode.init();
			SelectionAction.selectAffecteds();
			HaploWindow.init();
		    },500)
		}, 500);
	    }, 500);
	}
    },

    Allegro : {
	saveChrAndFlow(){
	    localStorage.setItem("ALLFLOW", debugAllegro.descent);
	    localStorage.setItem("ALLCHR", debugAllegro.haplo);
	    localStorage.setItem("ALLMAP", debugAllegro.map);
	},

	run(){
	    MainButtonActions.preamble();

	    setTimeout(function(){
		MainPageHandler.haplomodeload();

		setTimeout(function(){
		    userOpts.fancyGraphics = false;

		    var haplo_text = localStorage.getItem("ALLCHR");
		    var found_text = localStorage.getItem("ALLFLOW");
		    var map_text   = localStorage.getItem("ALLMAP");

		    Allegro.__populateFamilyAndHaploMap(haplo_text);
		    Allegro.__populateFlow(found_text);
		    Allegro.__populateGeneticPositions(map_text);

		    HaploPedProps.init();
		    FileFormat.__endFuncs( AssignHGroups.resolvers.FLOW );

		    setTimeout(function(){
			SelectionMode.init();
			SelectionAction.selectAffecteds();
			HaploWindow.init();
		    },500)
		}, 500);
	    }, 500);
	}
    },


    Merlin : {
	saveChrAndFlow(){
	    localStorage.setItem("MERLINFLOW", debugMerlin.descent);
	    localStorage.setItem("MERLINCHR", debugMerlin.haplo);
	    localStorage.setItem("MERLINPED", debugMerlin.ped);
	    localStorage.setItem("MERLINMAP", debugMerlin.map);
	},

	run(){
	    MainButtonActions.preamble();

	    setTimeout(function(){
		MainPageHandler.haplomodeload();

		setTimeout(function(){
		    userOpts.fancyGraphics = false;

		    var haplo_text = localStorage.getItem("MERLINCHR");
		    var chr_text   = localStorage.getItem("MERLINFLOW");
		    var map_text   = localStorage.getItem("MERLINMAP");
		    var ped_text   = localStorage.getItem("MERLINPED");

		    Merlin.populateFamilyAndHaploMap(haplo_text);
		    Merlin.populateMarkerMap(map_text)
		    Merlin.populateFlow(chr_text);
		    FileFormat.updateFamily(ped_text);

		    HaploPedProps.init(familyMapOps.inferGenders);
		    FileFormat.__endFuncs( AssignHGroups.resolvers.FLOW );

		    /*			setTimeout(function(){
					SelectionMode.init();
					SelectionAction.selectAffecteds();
					HaploWindow.init();
					},500)*/
		}, 500);
	    }, 500);
	}
    },

    Simwalk : {
	run(){
	    MainButtonActions.preamble();

	    setTimeout(function(){
		MainPageHandler.haplomodeload();

		setTimeout(function()
			   {
			       var usedesc = true;
			       var haplo_text  = localStorage.getItem("TEST");
			       Simwalk.populateFamHaploAndDesc(haplo_text, usedesc);

		               //			FileFormat.enumerateMarkers();
			       HaploPedProps.init();
			       FileFormat.__endFuncs(usedesc);
			   }, 500);
	    }, 500);			
	}
    },

    Homology : {
	run(){
	    userOpts.fancyGraphics = false;
	    userOpts.setGraphics();
	    MainButtonActions.loadHaploFromStorage();

	    setTimeout(function(){
		SelectionMode.init();
		SelectionAction.selectAffecteds();
		HaploWindow.init();

		setTimeout(function(){
		    HomologySelectionMode.init();
		    SelectionAction.selectAffecteds();
		    HomologySelectionMode.submit();

		    // setTimeout(function(){
		    // 	HomologyButtons._printCurrent();
		    // }, 1000);
		},1000);
	    },1000);
	}
    },

    Colors : FounderColor.testColors,
    
    PedCreate : {
	run(){
	    MainButtonActions.createNewPed()

	    familyDraw.addFam(1001)

	    personDraw.addNode(
		new Person(12,2,2),
		{x:0, y:50}
	    );

	    personDraw.addNode(
		new Person(11,1,1),
		{x:180, y:50}
	    );

	    personDraw.addNode(
		new Person(23,1,2),
		{x:90, y:150}
	    );
	}
    }
}

//Test.Homology.run()
