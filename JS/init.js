


function init(){
	
	connectAllIndividuals();
	populateGrids_and_UniqueObjs();

	determinePedigreeType();
	graphInitPos(nodeSize + 10, grid_rezY);

	if (fileType === "allegro"){
		assignHGroups();
		washMarkerMap();

		populateIndexDataList();

	// toggle_haplomode(20);
//		startSelectionMode();
/*		for (var key in selection_items){

			var fid_id = key.split('_'),
				fid = fid_id[0],
				id = fid_id[1];

			var item = selection_items[key];

			if (id >= 6 && id <=10){
				item.box.fire('click')
			}
		}
		launchHaplomode();*/
	}
}


//MainPageHandler.defaultload();
/*setTimeout(function(){

},3000);*/

MainButtonActions.createNewPed()	
