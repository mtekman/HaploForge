

var init = {

	haploview : function(){
		HaploPedProps.init();
		graphInitPos(nodeSize + 10, grid_rezY);

		if (MainButtonActions.fileType === FORMAT.HAPLO.ALLEGRO){
			assignHGroups();
			washMarkerMap();

			populateIndexDataList();
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

			(new Genehunter(HaploPedProps.init));

		}, 1000);
	}, 1000);
}


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