

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

		console.log("John snow");
	}
}


//MainButtonActions.loadHaploFromStorage();
MainPageHandler.defaultload();
//MainButtonActions.loadPedFromStorage();

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
		ButtonModes.setToSelectionMode();

		setTimeout(function(){
			ButtonModes.toggle_selection_affecteds = !ButtonModes.toggle_selection_affecteds || false;

			for (var key in SelectionMode._items){
				var item = SelectionMode._items[key];
				var affected = (item.graphics.children[0].attrs.fill === col_affs[2])

				if (affected){
					if( (ButtonModes.toggle_selection_affecteds && !item.selected)
			 		|| (!ButtonModes.toggle_selection_affecteds && item.selected) ){
						item.box.fire('click');
					}
				}
			}
			HaploWindow.init();
		}, 100);
	}, 100);
}, 100);
*/