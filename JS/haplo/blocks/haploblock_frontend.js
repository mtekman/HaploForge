var sta_index = 0,
	end_index = HAP_DRAW_LIM;

var haploinfos; // what addHaploBlocksAll uses (needs to be generated once per fam)


// function getMarkerText(){
// 	//Add marker lines
// 	var dd = [[],[]];

// 	for (var d=sta_index; d <= end_index; d++){
// 		dd[0].push( "" );
// 		dd[1].push( marker_array[d] );
// 	}
// 	// 		console.log(dd);
// 	return dd;
// }


/* Called once - displays multiple individuals across any family */
function addHaplosAnyone(id_map, parent_node)
{
	haploinfos = []; //clean

	for (var fid in id_map){
		for (var p = 0; p< id_map[fid].length; p++){
			var pers_id = id_map[fid][p],
				pers_hp = family_map[fid][pers_id].haplo_data;
			haploinfos.push(pers_hp);
		}
	}
	redrawHaplos();
}



/* Called once - displays all individuals in a given family */
function addHaplosFamily(fam, parent_node){ //called by toggle_haplotypes in haplo/toggle.js

	haploinfos = []; //clean

	for (var g = 0; g < generation_grid_ids[fam].length; g++)
	{
		for (var p =0; p < generation_grid_ids[fam][g].length; p++)
		{
			var pers_id = generation_grid_ids[fam][g][p],
				pers_hp = family_map[fam][pers_id].haplo_data;

			haploinfos.push( pers_hp );
		}
	}
// 		console.log("calling", haploinfos);
	redrawHaplos();
}




/* Redraws the current haplodata_arr group, regardless of who they are

*/
function redrawHaplos(resizeToo = false){
	var scroll_rect = unique_graph_objs.haplo_scroll,
		scroll_area = unique_graph_objs.haplo_area;

	var diff_y = scroll_rect.getAbsolutePosition().y - scroll_area.getAbsolutePosition().y,
		index_start_delta = Math.floor( diff_y / HAP_VERT_SPA );

//	console.log("diffy="+diff_y, "ind_start_d="+index_start_delta);
	sta_index += index_start_delta;
	end_index += index_start_delta;
//	console.log("shifting by "+index_start_delta);

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

	var new_haplos = addHaploBlocksAll();

	scroll_area.add( new_haplos );
	scroll_area.parent.show();
	haplo_layer.draw();


	if (resizeToo)
		resizeCanvas();
}



// function addHaplos_OLD(fam, parent_node){ //called by toggle_haplotypes in haplo/toggle.js

// 	var marker_gfx = addHaploBlocks( getMarkerText() );
// 	marker_gfx.setX( marker_gfx.getX() - 50 );

// 	parent_node.add( marker_gfx );

// 	for (var g = 0; g < generation_grid_ids[fam].length; g++)
// 	{
// 		for (var p =0; p < generation_grid_ids[fam][g].length; p++)
// 		{
// 			var pers_id = generation_grid_ids[fam][g][p],
// 				pers_hp = family_map[fam][pers_id].haplo_data;

// 			var data_alleles = [],
// 				data_hapgrps = [];
// 			for (var al = 0; al < pers_hp.length; al++)
// 			{
// 				var one_allele_window = [],
// 					one_hapgrp_window = [];

// 				for( var d=sta_index; d <= end_index; d++){
// 					one_allele_window.push( pers_hp[al].data_array[d] );
// 					one_hapgrp_window.push( pers_hp[al].haplogroup_array[d] );
// 				}
// 				data_alleles.push( one_allele_window );
// 				data_hapgrps.push( one_hapgrp_window );
// 			}
// // 			console.log(data_alleles);
// // 			console.log(pers_id, pers_hp);

// 			var	g_pers  = unique_graph_objs[fam].nodes[pers_id];


// 			// destroy all previous data
// 			if (g_pers.haplo_group != undefined){
// 				g_pers.haplo_group.destroyChildren();
// 				g_pers.haplo_group.destroy();
// 			}
// 			g_pers.haplo_group = addHaploBlocks( data_alleles, data_hapgrps, fam );

// 			//set xcoords to that of g_pers
// 			g_pers.haplo_group.setX( g_pers.graphics.getX() - haplomode_panel_xoffs );

// 			parent_node.add(g_pers.haplo_group);
// 		}
// 	}

// 	parent_node.parent.show();
// 	haplo_layer.draw();
// }
