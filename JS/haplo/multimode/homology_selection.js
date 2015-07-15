
function scan_alleles_for_homology( ids_to_scan ){


	var allele_array = [];

	for (var i=0; i < ids_to_scan.length; i++){
		var fid_id = ids_to_scan[i].split('_'),
			fid = fid_id[0], 
			id = fid_id[1];

		var perc_haplo_data = family_map[fid][id].haplo_data

		for (var a=0; a < perc_haplo_data.length; a++){
			allele_array.push(perc_haplo_data[a]);
		}
	}

	var num_markers = marker_array.length;

	for (var m=0; m < num_markers; m++)
	{
		// Store res here..

		for (var a=0; a < allele_array.length; a++){

		}
	}
}




var homology_selection_mode = function(){


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
			var selected_for_homology = [];
		
			for (var s in selection_items){
				if (selection_items[s].selected){
					selected_for_homology.push(s);
				}
			}

			sub_select_group.destroyChildren();
			sub_select_group.destroy();

			haplo_layer.draw();

			scan_alleles_for_homology( selected_for_homology );
		}
	));


	
	for (var fid in unique_graph_objs){
		for (var node in unique_graph_objs[fid].nodes)
		{
			if (node == 0) continue;

			var key = fid+"_"+node

			var gfx = unique_graph_objs[fid].nodes[node].graphics,
				pos = gfx.getAbsolutePosition(),
				bounder = addBounder(pos, key, false);

			// By default not enabled
			selection_items[key] = {
				box:bounder,
				selected:false,
				graphics: gfx
			};
			sub_select_group.add(bounder);
		}
	}

	haplo_layer.add(sub_select_group);
	sub_select_group.setZIndex(20);
	haplo_layer.draw();
}