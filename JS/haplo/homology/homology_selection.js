

var homology_selection_mode = function()
{
	// Main selection layer
	var sub_select_group = new Kinetic.Group({
		x:0, y:0,
		width: stage.getWidth(),
		height: stage.getHeight()
	});

	sub_select_group.add(new Kinetic.Rect({
			x:0, y:0,
			width: stage.getWidth(),
			height: stage.getHeight(),
			fill: 'black',
			strokeWidth: 0,
			opacity: 0.2
	}));

	sub_select_group.add(addButton("Submit Selection", 0, 0,
		function()
		{
			// var selected_for_homology = []; // Now global in homology_buttons.js
			selected_for_homology = [];
		
			for (var s in selection_items){
				if (selection_items[s].selected){
					selected_for_homology.push(s);
				}
			}

			// Shift top panel to front layer
			haplo_window.top.moveTo(haplo_window)
			haplo_window.top.exit.show();


			sub_select_group.destroyChildren();
			sub_select_group.destroy();

			haplo_layer.draw();

			if (selected_for_homology.length === 0)
				return -1;

			plots = scan_alleles_for_homology( selected_for_homology );

			homology_buttons_show();
			homology_buttons_redraw();

			return 0;
		}
	));

	
	// Shift top panel to front layer
	haplo_window.top.moveTo(sub_select_group)
	haplo_window.top.exit.hide();

	for (var c=0; c < haplo_group_nodes.children.length; c++){
	// for (var fid in unique_graph_objs){
	// 	for (var node in unique_graph_objs[fid].nodes)
	// 	{
			var node = haplo_group_nodes.children[c];

			if (node == 0) continue;

			var key = node.attrs.id;

			var gfx = node,
				pos = gfx.getAbsolutePosition(),
				bounder = addBounder(pos, key, false);

			// By default not enabled
			selection_items[key] = {
				box:bounder,
				selected:false,
				graphics: gfx
			};
			sub_select_group.add(bounder);
		// }
	}


	haplo_layer.add(sub_select_group);
	sub_select_group.setZIndex(20);
	haplo_layer.draw();
}