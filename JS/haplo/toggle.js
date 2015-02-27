var toggle_haplo = false,
	toggle_horiz = false,
	toggle_haplobutton = false,
	backg;

// Start/Stop HaploMode
function toggle_haplomode(fam_id)
{
	if (transition_happening)
		return; 											// Ignore overclicks

	if (toggle_horiz) toggle_horizAlign(fam_id); 			// Unalign if aligned first
	if (toggle_haplobutton) toggle_haplotypes(fam_id);			// Hide Haplotypes if shown


	toggle_haplo = !toggle_haplo;

	var	n_caa     = unique_graph_objs[fam_id],
		grp       = n_caa.group;

	if (toggle_haplo){

		backg = new Kinetic.Rect({
			x:0, y:0,
			width: window.innerWidth,
			height: window.innerHeight,
			fill: 'black',
			opacity:0.5
		});
		grp.remove(); 										  // remove from parent but do not destroy;
		haplo_layer.add(grp); 								  // add to haplo

		var final_pos = transitionToggle(fam_id, toggle_haplo, lineswitch=true, use_y=true, groupmove=true, onfinishfunc=0, draggable=!toggle_haplo);

		var panel_a_scroll = addHaploScreen(final_pos.x, final_pos.y, fam_id);

		n_caa.haplo_panel  = panel_a_scroll[0]; 		// Entire panel
		n_caa.haplo_scroll = panel_a_scroll[1]; 		// Scroll window (stays stationary
		n_caa.haplo_area   = panel_a_scroll[2];  		// Haplotypes are grouped (and draggable) here
		n_caa.haplo_pedbg  = panel_a_scroll[3]; 		// Rect background

		n_caa.group.add(n_caa.haplo_panel);
		n_caa.haplo_panel.moveToBottom();

		haplo_layer.add(backg);
	}
	else {
		n_caa.haplo_panel.remove();
		n_caa.haplo_panel.destroy();//

		var callback = function(){
			grp.remove(); 			  					  // remove from parent but do not destroy;
			main_layer.add(grp); 						  // add to main
			main_layer.draw();

//			haplo_layer.destroyChildren();
		}

		transitionToggle(fam_id, toggle_haplo, lineswitch=true, use_y=true, groupmove = true,
						 onfinishfunc=callback);

		backg.destroy();
	}
}


//Within haplomode
function toggle_horizAlign(fam_id)
{
	if (transition_happening) return; 						// Ignore overclicks
	toggle_horiz = !toggle_horiz;

	transitionToggle(fam_id, toggle_horiz, lineswitch=!toggle_horiz, use_y=false, groupmove=false, onfinishfunc=0, draggable=false);

	function boxlim (horizontal){
		var min_y = nodeSize*8; //starting point
		if (horizontal) return min_y;
		else
			return min_y + ((nodeSize*2)+5)*(generation_grid_ids[fam_id].length-1);
	}

	var end_y = boxlim(toggle_horiz);



	//Resize boxes dynamically:
	(new Kinetic.Tween({
		node: unique_graph_objs[fam_id].haplo_pedbg,
		height: end_y,
		duration: 1
	})).play();

	if (toggle_haplobutton){
		(new Kinetic.Tween({
			node: unique_graph_objs[fam_id].haplo_scroll,
			y: end_y,
			duration: 1
		})).play();
	}
}


//Within haplomode
function toggle_haplotypes(fam){

	toggle_haplobutton = !toggle_haplobutton;

	var scroll_panel_grp = unique_graph_objs[fam].haplo_area;

	if (toggle_haplobutton)
		addHaplos(fam, scroll_panel_grp);
	else
		scroll_panel_grp.destroyChildren();


	toggle_haplobutton?scroll_panel_grp.parent.show():scroll_panel_grp.parent.hide();

	haplo_layer.draw();
}
