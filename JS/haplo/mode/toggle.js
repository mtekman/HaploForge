// var toggle_haplo = false,
// 	toggle_horiz = false,
// 	toggle_haplobutton = false,
// 	toggle_zoommarkers = false,
// 	transition_happening = false,
// 	backg;

// // Start/Stop HaploMode
// function toggle_haplomode(haplofam_map)
// {
// 	if (transition_happening)
// 		return; 											// Ignore overclicks

// 	if (toggle_horiz) toggle_horizAlign(haplofam_map); 			// Unalign if aligned first
// 	if (toggle_haplobutton) toggle_haplotypes(haplofam_map);		// Hide Haplotypes if shown
// 	if (toggle_zoommarkers) toggle_zoomer(); 				// Hide zoomer


// 	toggle_haplo = !toggle_haplo;

// 	var	n_caa     = unique_graph_objs,
// 		grp       = unique_graph_objs[haplofam_map].group;


// 	/* for each selected individual in each family in the haplofam_map
// 		- 
// 		- Consistent handling:
// 		  - Single families bypass selection mode, -> tick all members of pedigree

// 		  - Selection mode passes selected individuals mapped into families
// 		  - Copy selected individual shapes onto haplo_layer and hide the shapes in main
// 		    - if selected individuals in a family comprise the entire family, hide the lines for that family too
// 		    - (attach a .all_selected var to the map value for that family)

// 		  - Animate nodes into new positions.
// 		  - Create new lines:
// 		     - If entire family is selected, clone existing lines and retouch.
// 		     - else create new lines showing degrees of seperation (sibs are simple n lines, gens have dos number in middle)

// 	*/

// 	if (toggle_haplo)
// 	{
// 		backg = new Kinetic.Rect({
// 			x:0, y:0,
// 			width: window.innerWidth,
// 			height: window.innerHeight,
// 			fill: 'black',
// 			opacity:0.5
// 		});

// 		haplo_layer.add(backg);
// 		backg.setZIndex(-98);


// 		var final_pos = transitionToggle(haplofam_map, toggle_haplo, lineswitch=true, use_y=true, groupmove=true, onfinishfunc=0, draggable=!toggle_haplo);

// 		var panel_a_scroll = addHaploScreen(final_pos.x, final_pos.y);

// 		n_caa.haplo_panel  = panel_a_scroll; 			// Entire panel
// 		n_caa.haplo_scroll = panel_a_scroll.main_box; 	// Scroll window (stays stationary
// 		n_caa.haplo_area   = panel_a_scroll.scrollable; // Haplotypes are grouped (and draggable) here
// 		n_caa.haplo_pedgrp = panel_a_scroll.ped_grp;	// Ped Panel

// 		n_caa.haplo_pedbg  = panel_a_scroll.ped_grp.background;		// Rect background
// 		n_caa.haplo_panel.setZIndex(-99);
// 	} 
// 	else {
// 		backg.destroy();

// 		n_caa.haplo_panel.remove();
// 		n_caa.haplo_panel.destroy();//

// // 		var callback = function(){
// // 			// grp.remove(); 			  					  // remove from parent but do not destroy;
// // 			// main_layer.add(grp); 						  // add to main
// // 			main_layer.draw();
// // //			haplo_layer.destroyChildren();
// // 		}

// 		transitionToggle(haplofam_map, toggle_haplo, lineswitch=true, use_y=true, groupmove = true,
// 						 onfinishfunc=0);
// 	}



		
// 	// 	grp.remove(); 										  // remove from parent but do not destroy;
// 	// 	haplo_layer.add(grp); 								  // add to haplo

	

// 	// 	grp.add(n_caa.haplo_panel);

// 	// }
// }


// //Within haplomode
// function toggle_horizAlign(haplofam_map)
// {
// 	if (transition_happening) return; 						// Ignore overclicks
// 	toggle_horiz = !toggle_horiz;

// 	transitionToggle(haplofam_map, toggle_horiz, lineswitch=!toggle_horiz, use_y=false, groupmove=false, onfinishfunc=0, draggable=false);

// 	var end_y = (function boxlim(){
// 		var min_y = nodeSize*8; //starting point
// 		if (toggle_horiz) return min_y;
// 		else
// 			return min_y + ((nodeSize*2)+5)*10; //(generation_grid_ids[fam_id].length-1);
// 	})();

// 	//Resize boxes dynamically:
// 	(new Kinetic.Tween({
// 		node: unique_graph_objs.haplo_pedbg,
// 		height: end_y,
// 		duration: 1
// 	})).play();

// 	// if (toggle_haplobutton){
// 		(new Kinetic.Tween({
// 			node: unique_graph_objs.haplo_scroll,
// 			y: end_y,
// 			duration: 1
// 		})).play();
// 	// }
// }


// //Within haplomode
// function toggle_haplotypes(haplofam_map)
// {
// 	if (transition_happening) return; 						// Ignore overclicks

// 	toggle_haplobutton = !toggle_haplobutton;

// 	var scroll_panel_grp = unique_graph_objs.haplo_area,
// 		zoom_button = unique_graph_objs.haplo_pedgrp.zoomer;

// 	if (toggle_haplobutton){
// //		addHaplosFamily(fam);
// 		addHaplosAnyone(haplofam_map);
// 		scroll_panel_grp.parent.show();
// 		zoom_button.show()
// 	}
// 	else{
// 		scroll_panel_grp.destroyChildren();
// 		scroll_panel_grp.parent.hide();
// 		zoom_button.hide();
// 	}
// 	haplo_layer.draw();
// }


// //Within Haplomode
// function toggle_zoomer()
// {
// 	if (transition_happening) return;

// 	toggle_zoommarkers = !toggle_zoommarkers;

// 	var marker_slid = getSlider(20,50);

// 	if (toggle_zoommarkers){
// 		mscale_layer.add(marker_slid);
// 		stage.add(mscale_layer);

// 		updateInputsByIndex(0, HAP_DRAW_LIM);
// 		updateSlide();
// 	}
// 	else {
// // 		marker_slid.destroy();
// // 		marker_slid.destroyChildren();
// 		mscale_layer.destroyChildren();
// 		stage.remove(mscale_layer);
// 	}
// 	mscale_layer.draw();
// }
