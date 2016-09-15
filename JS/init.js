
var init = {

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
//MainButtonActions.loadPedFromStorage();





// Genehunter test
function test(){

	MainButtonActions.preamble();

	setTimeout(function(){
		MainPageHandler.haplomodeload();

		setTimeout(function(){

			(new Genehunter(function(){
				HaploPedProps.init(function(){
					familyMapOps.inferGenders();
				})
			}));
			graphInitPos(nodeSize + 10, grid_rezY);
			assignHGroups();

			MarkerData.padMarkerMap();

			populateIndexDataList();

			setTimeout(function(){
				SelectionMode.init();
				SelectionAction.selectAffecteds();
				HaploWindow.init();
			},500)
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