
var SelectionMode = {

	_ids_map : {}, // Generational map
	_ids 	 : {}, // Just a map of ids
	_items   : {},

	_select_group : null,

	destroy: function stopSelectionMode()
	{
		homology_buttons_exit();

		SelectionMode._select_group.destroyChildren();
		SelectionMode._select_group.destroy();

		// Reset all
		SelectionMode._ids_map = {}
		SelectionMode._ids = {};
		SelectionMode._items = {}

		//Delete zoom
		if (markerInstance !== null){
			markerInstance.remove();
		}
		haplo_layer.draw();
		main_layer.draw();
	},

	init: function startSelectionMode()
	{
		// Main selection layer
		SelectionMode._select_group = new Kinetic.Group({
			x:0, y:0,
			width: stage.getWidth(),
			height: stage.getHeight()
		});

		SelectionMode._select_group.add(new Kinetic.Rect({
			x:0, y:0,
			width: stage.getWidth(),
			height: stage.getHeight(),
			fill: 'black',
			strokeWidth: 0,
			opacity: 0.1
		}));


		uniqueGraphOps.foreachfam(function(fid){
			var text_butt = uniqueGraphOps.getFam(fid).group.fam_title_text;
			var text_bounder = SelectionGraphics.addInvisibleBounder(
				text_butt.getAbsolutePosition(), fid, true
			);

			SelectionMode._select_group.add(text_bounder)

			uniqueGraphOps.foreachnode(function(node, fid){
				if (node != 0)
				{
					var key = fid+"_"+node

					var gfx = uniqueGraphOps.getFam(fid).nodes[node].graphics,
						pos = gfx.getAbsolutePosition(),
						bounder = SelectionGraphics.addBounder(pos, key, true);

					gfx.attrs.draggable = false;

					// By default not enabled
					SelectionMode._items[key] = {
						box:bounder,
						selected:false,
						graphics: gfx
					};
					SelectionMode._select_group.add(bounder);
				}
			});
		});

		main_layer.add(SelectionMode._select_group);
		SelectionMode._select_group.setZIndex(20);

		main_layer.draw();
	},

	markSelecteds: function()
	{
		SelectionMode._ids_map = {}
		SelectionMode._ids = {}

		for (var fam_pid in SelectionMode._items){
		  	var item = SelectionMode._items[fam_pid];

		 	if (!item.selected) continue;
		 	
		 	var fam = fam_pid.split("_")[0],
		 		pid = fam_pid.split("_")[1];

		 	if (!(fam in SelectionMode._ids_map)){
		 		SelectionMode._ids_map[fam] = {}; // generations, key first - array later
		 		
		 		SelectionMode._ids[fam] = {};
		 	}
		 	SelectionMode._ids[fam][pid] = 1;

		 	//Hopefully these are at the same level with few discrepencies
		 	var generation = item.graphics.getY()

		 	SelectionMode._ids_map[fam][generation] = SelectionMode._ids_map[fam][generation] || [];
		 	SelectionMode._ids_map[fam][generation].push( pid );
		}

		for (var fam in SelectionMode._ids_map){
			SelectionMode._ids_map[fam] = map2orderedArray( SelectionMode._ids_map[fam] )
		}
	},

	grabSelected: function(){
		SelectionMode._populateSelecteds();
		return SelectionMode
	},


	selectFam: function(fam_id){
		for (var key in SelectionMode._items){
			if (key.split("_")[0] == fam_id){
				SelectionMode._items[key].box.fire('click');
			}
		}
	},

	noneSelected: function(){
		return isEmpty(SelectionMode._ids);
	}
}