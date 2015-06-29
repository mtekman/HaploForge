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
function addHaplosAnyone(haplofam_map, parent_node)
{
	haploinfos = []; //clean

	for (var fid in haplofam_map){
		for (var pid in haplofam_map[fid])
		{
			var pers_hp = family_map[fid][pid].haplo_data;
			haploinfos.push(pers_hp);
		}
	}
	redrawHaplos(true);
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
	redrawHaplos(true);
}




/* Redraws the current haplodata_arr group, regardless of who they are

*/
function redrawHaplos(resizeToo){
	var scroll_rect = unique_graph_objs.haplo_scroll,
		scroll_area = unique_graph_objs.haplo_area;

	var diff_y = scroll_rect.getAbsolutePosition().y - scroll_area.getAbsolutePosition().y,
		index_start_delta = Math.floor( diff_y / HAP_VERT_SPA );

	// console.log("diffy="+diff_y, "ind_start_d="+index_start_delta);
	sta_index += index_start_delta;
	end_index += index_start_delta;
	// console.log("shifting by "+index_start_delta);

	// Delete after grabbing position
	scroll_area.destroyChildren();
	scroll_area.setY(0);

	// console.log("indexes = ", sta_index, end_index);

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