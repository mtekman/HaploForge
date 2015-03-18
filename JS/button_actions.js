var show_marker_map = false,
	slider_glob;

function toggleRAng(){
	use_right_angles = !use_right_angles;
	touchlines();
	main_layer.draw();
}

function playalong(){
	assignHGroups();
	addHaplos();
}

function toggleMarkerScale(){

	show_marker_map = !show_marker_map;

	if (show_marker_map){
		//Add marker_line
		slider_glob = makeSlider(10, 100);
		haplo_layer.add( slider_glob );

		updateInputsByIndex(0, HAP_DRAW_LIM);
		updateSlide();
		rangeline_pos = slwin_group.line.getAbsolutePosition();			// update pos

		haplo_layer.draw();
	}
	else {
		slider_glob.destroy();
// 		haplo_layer.draw();
	}
}
