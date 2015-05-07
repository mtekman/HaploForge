var start_positionx_haplomode = butt_w + nodeSize + haplomode_panel_xoffs;
var transition_happening=false;

// General Transitions for nodes and or groups of a given fam
// Assumes haplo_layer usage
function transitionToggle(haplofam_map, toggler, lineswitch, use_y, groupmove, onfinishfunc, draggable)
{
	var start_x = start_positionx_haplomode,
		start_y = use_y?0:nodeSize*2;

	var spacingx = min_haplo_x,
		spacingy = 5;



	function main_to_haplo(){
		// Stage 1: Move shapes (and lines for whole families)
		//          to haplo_layer
		for (var fam_id in haplofam_map){

			var gen_lines = generation_grid_ids[fam_id],
				n_caa = unique_graph_objs[fam_id],
				fam_o_interest = haplofam_map[fam_id],
				all_selected = fam_o_interest.all_selected;

			if (all_selected){
				//Hide ALL (lines et al)
				n_caa.group.remove();
				haplo_layer.add(n_caa.group)
			}
			else {
				var new_haplogroup = new Kinetic.Group({name:fam_id;});

				// Move partial shapes, but not the lines
				for (var id in fam_o_interest)
				{
					var n_chl = n_caa.nodes[id],
						gfx = n_chl.graphics;

					// Store old position for later
					n_chl.mainlayer_pos = gfx.getPosition();

					gfx.remove(); 			// Remove from main_layer 
					new_haplogroup.add(gfx);	// Add to haplo_layer
				}
				haplo_layer.add(new_haplogroup);
			}
		}
		main_layer.draw();
		haplo_layer.draw();
		// At this stage, we have family groups on the haplo_layer
		// some with adjoining lines, others without.


		// Stage 1i: For those without lines, determine degrees of seperation
		if (!all_selected){
			for (var fam_id in haplofam_map){

				var subgrid_map = {},
					working_map = generation_grid_ids[fam_id];

			}
			
		}


	}






		//	n_caa.group.moveToTop();
		linesShow(fam_id, false); 								// Hide lines during transition

		//Below used when addHaplos_OLD was in action

		for (var g=0; g < gen_lines.length; g++){

			var incremental_y = 0;
			if (use_y) incremental_y = (gen_lines[g].length+1) * spacingy;

			for (var c=0; c < gen_lines[g].length; c++){
				var ch_id = gen_lines[g][c],
					n_chl = n_caa.nodes[ch_id],
					gfx = n_chl.graphics;

				n_chl.start_pos = n_chl.start_pos || [];

				var pos_loc = n_chl.start_pos,
					pos_pos;

				if (toggler) pos_loc.push( gfx.getPosition() );
				else pos_pos = pos_loc.pop();

				gfx.setDraggable(draggable);
				gfx.setZIndex(-20);

				// Set animation
				var tween = new Kinetic.Tween({
					node: gfx,
					x: toggler?start_x:pos_pos.x,
					y: toggler?start_y+incremental_y:pos_pos.y,
					duration:0.8,								// Slightly faster than group
					easing: Kinetic.Easings.EaseIn
				});

				tween.play();
				start_x += spacingx;

				if (use_y)
					incremental_y -= spacingy;
			}
			if (use_y)
				start_y += (nodeSize*2) + 6 + spacingy + incremental_y;
		}


	// 	if (groupmove){
	// 		var xx =20, yy= 50;

	// 		// Add background rect when moving group, remove on restore
	// 		n_caa.start_pos = n_caa.start_pos || [];

	// 		if (toggler) n_caa.start_pos.push( n_caa.group.getPosition() );
	// 		else {
	// 			var pos1 = n_caa.start_pos.pop(); 				//Revert position

	// 			xx = pos1.x; yy = pos1.y;
	// 		}

	// 		// Tween group
	// 		var tt = new Kinetic.Tween({
	// 			node: n_caa.group,
	// 			x: xx, y: yy,
	// 			duration: 1,  									// last slightly longer than child tweens
	// 			onFinish: function(){
	// 				linesShow(fam_id, true);
	// 				touchlines(!toggler);
	// 				transition_happening = false;
	// 				if (onfinishfunc!=0) onfinishfunc();
	// // 				console.log("current_layer= "+n_caa.group.parent.attrs.id);
	// 			},
	// 			easing: Kinetic.Easings.EaseOut
	// 		});
	// 		tt.play();
	// 		transition_happening = true;
	// 	}
	// 	else{
	// 		//If group not moving, still call the lineShow switch after 1 second delay if needed.
	// 		if (lineswitch){
	// 			(new Kinetic.Tween({
	// 				node: n_caa.group,
	// 				duration: 1,
	// 				onFinish: function(){
	// 					linesShow(fam_id, lineswitch);
	// 				}
	// 			})).play();
	// 		}
	// 	}
	}

	return {x:start_x, y:start_y};
}
