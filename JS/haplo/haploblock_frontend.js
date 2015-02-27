
function addHaplos(fam, parent_node, start_marker= 0, end_marker= 0){ //called by toggle_haplotypes in haplo/toggle.js

	var sta_index = 0,
		end_index = HAP_DRAW_LIM;

	if(start_marker !=0 && end_marker !=0 ){
		sta_index = marker_map[start_marker],
		end_index = marker_map[end_marker];

		assert(end_index - sta_index <= HAP_DRAW_LIM, "data exceeds haplo limit");
	}
	else console.log("showing only the first", HAP_DRAW_LIM," for now.");


	// Skip the first generation
	for (var g = 0; g < generation_grid_ids[fam].length; g++)
	{
		for (var p =0; p < generation_grid_ids[fam][g].length; p++)
		{
			var pers_id = generation_grid_ids[fam][g][p];
			var	pers_hp = family_map[fam][pers_id].haplo_data;

			var data_alleles = [];
			for (var al = 0; al < pers_hp.length; al++)
				data_alleles.push(pers_hp[al].slice(sta_index, end_index+1));

// 			console.log(pers_id, pers_hp);
			var	g_pers  = unique_graph_objs[fam].nodes[pers_id];


			// destroy all previous data
			if (g_pers.haplo_group != undefined){
				g_pers.haplo_group.destroyChildren();
				g_pers.haplo_group.destroy();
			}

			g_pers.haplo_group = addHaploBlocks( data_alleles );

			//set xcoords to that of g_pers
			g_pers.haplo_group.setX( g_pers.graphics.getX() );

			parent_node.add(g_pers.haplo_group);
		}
	}

	parent_node.parent.show();
	haplo_layer.draw();

}
