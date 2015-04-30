var toggle_haplo = false,
	toggle_horiz = false,
	toggle_haplobutton = false,
	toggle_zoommarkers = false,
	transition_happening = false,
	backg;

// Start/Stop HaploMode
function toggle_haplomode(fam_id)
{
	if (transition_happening)
		return; 											// Ignore overclicks

	if (toggle_horiz) toggle_horizAlign(fam_id); 			// Unalign if aligned first
	if (toggle_haplobutton) toggle_haplotypes(fam_id);		// Hide Haplotypes if shown
	if (toggle_zoommarkers) toggle_zoomer(); 				// Hide zoomer


	toggle_haplo = !toggle_haplo;

	var	n_caa     = unique_graph_objs,
		grp       = unique_graph_objs[fam_id].group;

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

		n_caa.haplo_panel  = panel_a_scroll; 			// Entire panel
		n_caa.haplo_scroll = panel_a_scroll.main_box; 	// Scroll window (stays stationary
		n_caa.haplo_area   = panel_a_scroll.scrollable; // Haplotypes are grouped (and draggable) here
		n_caa.haplo_pedgrp = panel_a_scroll.ped_grp;	// Ped Panel

		n_caa.haplo_pedbg  = panel_a_scroll.ped_grp.background;		// Rect background

		grp.add(n_caa.haplo_panel);
		n_caa.haplo_panel.setZIndex(-99);

		haplo_layer.add(backg);
		backg.setZIndex(-98);
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

	var end_y = (function boxlim(){
		var min_y = nodeSize*8; //starting point
		if (toggle_horiz) return min_y;
		else
			return min_y + ((nodeSize*2)+5)*(generation_grid_ids[fam_id].length-1);
	})();

	//Resize boxes dynamically:
	(new Kinetic.Tween({
		node: unique_graph_objs.haplo_pedbg,
		height: end_y,
		duration: 1
	})).play();

	// if (toggle_haplobutton){
		(new Kinetic.Tween({
			node: unique_graph_objs.haplo_scroll,
			y: end_y,
			duration: 1
		})).play();
	// }
}


//Within haplomode
function toggle_haplotypes(fam)
{
	if (transition_happening) return; 						// Ignore overclicks

	toggle_haplobutton = !toggle_haplobutton;

	var scroll_panel_grp = unique_graph_objs.haplo_area,
		zoom_button = unique_graph_objs.haplo_pedgrp.zoomer;

	if (toggle_haplobutton){
		addHaplosFamily(fam);
		scroll_panel_grp.parent.show();
		zoom_button.show()
	}
	else{
		scroll_panel_grp.destroyChildren();
		scroll_panel_grp.parent.hide();
		zoom_button.hide();
	}
	haplo_layer.draw();
}


//Within Haplomode
function toggle_zoomer()
{
	if (transition_happening) return;

	toggle_zoommarkers = !toggle_zoommarkers;

	var marker_slid = getSlider(20,50);

	if (toggle_zoommarkers){
		mscale_layer.add(marker_slid);
		stage.add(mscale_layer);

		updateInputsByIndex(0, HAP_DRAW_LIM);
		updateSlide();
	}
	else {
// 		marker_slid.destroy();
// 		marker_slid.destroyChildren();
		mscale_layer.destroyChildren();
		stage.remove(mscale_layer);
	}
	mscale_layer.draw();
}
