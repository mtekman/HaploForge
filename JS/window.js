

function resizeCanvas(){
	stage.setWidth(window.innerWidth);

	var new_height = ((HAP_DRAW_LIM+5) * HAP_VERT_SPA)+200;

	if (new_height < window.innerHeight)
		new_height = window.innerHeight;

	stage.setHeight(new_height);

	haplo_window.background.setWidth(window.innerWidth);
	haplo_window.background.setHeight(new_height);

	haplo_layer.draw();
}
