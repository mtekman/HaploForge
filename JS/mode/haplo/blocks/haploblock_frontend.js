var sta_index = 0,
	end_index = HAP_DRAW_LIM;

var haploinfos; // what addHaploBlocksAll uses (needs to be generated once per fam)


// function getMarkerText(){
// 	//Add marker lines
// 	var dd = [[],[]];

// 	for (var d=sta_index; d <= end_index; d++){
// 		dd[0].push( "" );
// 		dd[1].push( MarkerData.rs_array[d] );
// 	}
// 	// 		console.log(dd);
// 	return dd;
// }


/* Called once - displays multiple individuals across any family */
function addHaplosAnyone(haplofam_map, parent_node)
{
	haploinfos = []; //clean

	var position_by_xpos = {};

	for (var fid in haplofam_map)
	{
		var fam_x = uniqueGraphOps.getFam(fid).group.getX();

		for (var pid in haplofam_map[fid])
		{
			var pers_x = uniqueGraphOps.getNode(pid,fid).graphics.getX() + fam_x,
				pers_hp = familyMapOps.getPerc(pid,fid).haplo_data;

			//haploinfos.push(pers_hp);
			if (pers_x in position_by_xpos){
				console.log("ERROR, duplicate position!");
				continue;
			}
			position_by_xpos[pers_x] = {fam:fid, per:pid, data:pers_hp};
		}
	}


	var sorted_positions = Object.keys(position_by_xpos);
	sorted_positions.sort(function(a,b){ return Number(a)-Number(b);});

	for (var p=0; p < sorted_positions.length; p++){
		var key = sorted_positions[p];

		haploinfos.push( position_by_xpos[key].data );
	}

	redrawHaplos(true);
}


/* Redraws the current haplodata_arr group, regardless of who they are

*/
function redrawHaplos(resizeToo){
	var scroll_rect = uniqueGraphOps.haplo_scroll,
		scroll_area = uniqueGraphOps.haplo_area;

	var diff_y = scroll_rect.getAbsolutePosition().y - scroll_area.getAbsolutePosition().y,
		index_start_delta = Math.floor( diff_y / HAP_VERT_SPA );

	//console.log("diffy="+diff_y, "ind_start_d="+index_start_delta);
	sta_index += index_start_delta;
	end_index += index_start_delta;
	//console.log("shifting by "+index_start_delta, sta_index, end_index);



	// Update marker background height
	HaploWindow._left.setY( HaploWindow._bottom.rect.getAbsolutePosition().y );
	HaploWindow._left.setHeight( HaploWindow._bottom.rect.getHeight() );

	// Delete after grabbing position
	scroll_area.destroyChildren();
	scroll_area.setY(0);

	// console.log("indexes = ", sta_index, end_index);

	if (sta_index < 0){
		sta_index = 0;
		end_index = HAP_DRAW_LIM;
	}
	if (end_index > MarkerData.rs_array.length -1){
		end_index = MarkerData.rs_array.length -1
		sta_index = end_index - HAP_DRAW_LIM;
	}

	var new_haplos = addHaploBlocksAll();
	scroll_area.add( new_haplos );

	if (HomologyPlot.rendered_filtered_plot !== null && HomologyPlot.rendered_filtered_plot.length > 0)
	{
		var homology_overlays = addHomologyPlotOverlay();
		scroll_area.add( homology_overlays );
	}

	scroll_area.parent.show();
	haplo_layer.draw();

	//SliderHandler.updateInputsByIndex(sta_index, end_index)


	if (resizeToo)
		resizeCanvas();
}