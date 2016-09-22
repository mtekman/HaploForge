
var init = {

	clearMaps: function(){
		familyDraw.active_fam_group = null;
		
		GlobalLevelGrid.clear();
		MarkerData.clear();
		familyMapOps.clear();
		uniqueGraphOps.clear();
	},

	haploview : {

		allegro : function(){
			(new Allegro());
		},

		genehunter: function(){
			(new Genehunter()); // yeah "new" is required...
								// gc does its job
		},

		simwalk: function(){
			(new Simwalk());
		},

		merlin: function(){
			//utility.notify("TODO", "merlin");
			(new Merlin());
		}
	},

	pedcreate : function(){
		HaploPedProps.init();
		graphInitPos(nodeSize + 10, grid_rezY, true);
	}
}


MainPageHandler.defaultload();


function testhomology(){

	userOpts.allowTransitions = false;

	MainButtonActions.loadHaploFromStorage();

	setTimeout(function(){

		SelectionMode.init();
		SelectionAction.selectAffecteds();
		HaploWindow.init();

		setTimeout(function(){

			HomologySelectionMode.init();
			SelectionAction.selectAffecteds();
			HomologySelectionMode.submit();

		},1000);
	}, 1000);
}






// Merlin test
function test(){

	MainButtonActions.preamble();

	setTimeout(function(){
		MainPageHandler.haplomodeload();

		setTimeout(function(){

			var haplo_text  = localStorage.getItem("TEST");			

			Merlin.populateFamilyAndHaploMap(haplo_text);
			FileFormat.enumerateMarkers();

			HaploPedProps.init(familyMapOps.inferGenders);
			FileFormat.__endFuncs();

//			(new Simwalk());

/*			setTimeout(function(){
				SelectionMode.init();
				SelectionAction.selectAffecteds();
				HaploWindow.init();
			},500)*/
		}, 500);
	}, 500);
}

//FounderColor.__testColors(48)
//test();


/*
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
);*/
/*
*/

/*MainButtonActions.loadHaploFromStorage();
setTimeout(function()
{
	localStorage.setItem(localStor.transfer, MainButtonActions._temphaploload);
	utility.notify("transferring","...");

	MainButtonActions.loadPedFromStorage(true);
}, 100);*/