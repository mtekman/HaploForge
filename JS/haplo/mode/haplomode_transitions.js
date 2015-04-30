var start_positionx_haplomode = butt_w + nodeSize + haplomode_panel_xoffs;
var transition_happening=false;

// General Transitions for nodes and or groups of a given fam
// Assumes haplo_layer usage
function transitionToggle(fam_id, toggler, lineswitch=true, use_y=true, groupmove=true, onfinishfunc=0, draggable=true)
{
	var gen_lines = generation_grid_ids[fam_id],
		n_caa = unique_graph_objs[fam_id];

	var start_x = start_positionx_haplomode,
		start_y = use_y?0:nodeSize*2;

	//	n_caa.group.moveToTop();
	linesShow(fam_id, false); 								// Hide lines during transition

	var num_movers = Object.keys(n_caa.nodes).length;

	var spacingx = min_haplo_x,
		spacingy = 5;


	//Below used when addHaplos_OLD was in action

// 	var spacingx = (window.innerWidth - start_x) / num_movers;
//
// 	if (spacingx > max_haplo_x) spacingx = max_haplo_x;
// 	else if (spacingx < min_haplo_x) spacingx = min_haplo_x;

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


	if (groupmove){
		var xx =20, yy= 50;

		// Add background rect when moving group, remove on restore
		n_caa.start_pos = n_caa.start_pos || [];

		if (toggler) n_caa.start_pos.push( n_caa.group.getPosition() );
		else {
			var pos1 = n_caa.start_pos.pop(); 				//Revert position

			xx = pos1.x; yy = pos1.y;
		}

		// Tween group
		var tt = new Kinetic.Tween({
			node: n_caa.group,
			x: xx, y: yy,
			duration: 1,  									// last slightly longer than child tweens
			onFinish: function(){
				linesShow(fam_id, true);
				touchlines(!toggler);
				transition_happening = false;
				if (onfinishfunc!=0) onfinishfunc();
// 				console.log("current_layer= "+n_caa.group.parent.attrs.id);
			},
			easing: Kinetic.Easings.EaseOut
		});
		tt.play();
		transition_happening = true;
	}
	else{
		//If group not moving, still call the lineShow switch
		linesShow(fam_id, lineswitch);
	}

	return {x:start_x, y:start_y};
}
