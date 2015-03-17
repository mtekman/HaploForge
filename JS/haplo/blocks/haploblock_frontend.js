var sta_index = 0,
	end_index = HAP_DRAW_LIM;


function addHaplos(fam, parent_node){ //called by toggle_haplotypes in haplo/toggle.js

	//Add marker lines
	var marker_text = function(){
		var dd = [[],[]];

		for (var d=sta_index; d <= end_index; d++){
			dd[0].push( "" );
			dd[1].push( marker_array[d] );
		}
// 		console.log(dd);
		return dd;
	};
	var fin = addHaploBlocks( marker_text() );
	fin.setX( fin.getX() - 50 );

	parent_node.add( fin );


	for (var g = 0; g < generation_grid_ids[fam].length; g++)
	{
		for (var p =0; p < generation_grid_ids[fam][g].length; p++)
		{
			var pers_id = generation_grid_ids[fam][g][p],
				pers_hp = family_map[fam][pers_id].haplo_data;

			var data_alleles = [],
				data_hapgrps = [];
			for (var al = 0; al < pers_hp.length; al++)
			{
				var one_allele_window = [],
					one_hapgrp_window = [];

				for( var d=sta_index; d <= end_index; d++){
					one_allele_window.push( pers_hp[al].data_array[d] );
					one_hapgrp_window.push( pers_hp[al].haplogroup_array[d] );
				}
				data_alleles.push( one_allele_window );
				data_hapgrps.push( one_hapgrp_window );
			}
// 			console.log(data_alleles);
// 			console.log(pers_id, pers_hp);

			var	g_pers  = unique_graph_objs[fam].nodes[pers_id];


			// destroy all previous data
			if (g_pers.haplo_group != undefined){
				g_pers.haplo_group.destroyChildren();
				g_pers.haplo_group.destroy();
			}
			g_pers.haplo_group = addHaploBlocks( data_alleles, data_hapgrps, fam );

			//set xcoords to that of g_pers
			g_pers.haplo_group.setX( g_pers.graphics.getX() );

			parent_node.add(g_pers.haplo_group);
		}
	}

	parent_node.parent.show();
	haplo_layer.draw();

}


function redrawHaplos(fam_id, starting = 0){
	var scroll_rect = unique_graph_objs[fam_id].haplo_scroll,
		scroll_area = unique_graph_objs[fam_id].haplo_area;

	if (starting !== 0)
	{
		sta_index = starting;
		end_index = starting + HAP_DRAW_LIM;
	}
	else {
		var diff_y = scroll_rect.getAbsolutePosition().y - scroll_area.getAbsolutePosition().y,
			index_start_delta = Math.floor( diff_y / HAP_VERT_SPA );

		console.log("diffy="+diff_y, "ind_start_d="+index_start_delta);

		sta_index += index_start_delta;
		end_index += index_start_delta;
// 		console.log("shifting by "+index_start_delta);
	}

	// Delete after grabbing position
	scroll_area.destroyChildren();
	scroll_area.setY(0);


// 	console.log("indexes = ", sta_index, end_index);

	if (sta_index < 0){
		sta_index = 0;
		end_index = HAP_DRAW_LIM;
	}
	if (end_index > marker_array.length -1){
		end_index = marker_array.length -1
		sta_index = end_index - HAP_DRAW_LIM;
	}

	addHaplos(fam_id, scroll_area)
}
