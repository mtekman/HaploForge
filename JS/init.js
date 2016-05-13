

/* Called from Load Previous Button */
function loadPedFromStorage(){

	document.getElementById("buttons").style.display = 'none'

	var ped_data = localStorage.getItem( localStor.data_save ),
		ped_type = localStorage.getItem( localStor.data_type );


	//console.log( ped_data, ped_type);

	processInput(ped_data, ped_type);
	init();

}



function init(){
	
	connectAllIndividuals();
	populateGrids_and_UniqueObjs();

	determinePedigreeType();
	graphInitPos(nodeSize + 10, grid_rezY);

	assignHGroups();
	washMarkerMap();

	populateIndexDataList();

	// toggle_haplomode(20);
/*		startSelectionMode();
		for (var key in selection_items){

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


//loadPedFromStorage();