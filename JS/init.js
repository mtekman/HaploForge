


function init(){
	
	connectAllIndividuals();
	populateGrids_and_UniqueObjs();

	determinePedigreeType();
	graphInitPos(nodeSize + 10, grid_rezY);

	if (MainButtonActions.fileType === "allegro"){
		assignHGroups();
		washMarkerMap();

		populateIndexDataList();

	// toggle_haplomode(20);
//		SelectionMode.init();
/*		for (var key in SelectionMode._items){

			var fid_id = key.split('_'),
				fid = fid_id[0],
				id = fid_id[1];

			var item = SelectionMode._items[key];

			if (id >= 6 && id <=10){
				item.box.fire('click')
			}
		}
		launchHaplomode();*/
	}
}


//MainButtonActions.loadHaploFromStorage();
MainPageHandler.defaultload();
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

setTimeout(function(){
	SelectionMode.init();

	setTimeout(function(){
		ToolSetModes.setToSelectionMode();

		setTimeout(function(){
			ToolSetModes.toggle_selection_affecteds = !ToolSetModes.toggle_selection_affecteds || false;

			for (var key in SelectionMode._items){
				var item = SelectionMode._items[key];
				var affected = (item.graphics.children[0].attrs.fill === col_affs[2])

				if (affected){
					if( (ToolSetModes.toggle_selection_affecteds && !item.selected)
			 		|| (!ToolSetModes.toggle_selection_affecteds && item.selected) ){
						item.box.fire('click');
					}
				}
			}
			HaploWindow.init();
		}, 100);
	}, 100);
}, 100);
*/