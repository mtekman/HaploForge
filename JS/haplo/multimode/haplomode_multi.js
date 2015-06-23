// Haplomode is launched from here



function stopHaplomode(){
	

	
}

function launchHaplomode()
{
	var selection_map = function grabSelecteds(){
		var idmap = {}

		for (var fam_pid in selection_items){
		  	var item = selection_items[fam_pid];

		 	if (!item.selected) continue;
		 	
		 	var fam = fam_pid.split("_")[0],
		 		pid = fam_pid.split("_")[1];

		 	if (!(fam in idmap)){
		 		idmap[fam] = {}; // generations, key first - array later
		 	}

		 	//Hopefully these are at the same level with few discrepencies
		 	var generation = item.graphics.getY()

		 	idmap[fam][generation] = idmap[fam][generation] || [];
		 	idmap[fam][generation].push( pid );
		 }

		for (var fam in idmap)
			idmap[fam] = map2orderedArray( idmap[fam] )

		return idmap;
	};

	var line_data = findDOSinSelection( selection_map() );

	makeHaploTypeWindow( line_data );
}


// Just the top box
function makeHaploTypeWindow( lines_nodes_to_render )
{
	var line_points = lines_nodes_to_render.lp,
		slot_array = lines_nodes_to_render.sa;

	var res = mapLinesAndNodes( line_points, slot_array );
	console.log("AFTER SLOT=", slot_array);
	var box_lims_and_group = render( res );

	var render_group = box_lims_and_group.group,
		min_pos = box_lims_and_group.min,
		max_pos = box_lims_and_group.max;


	var haplo_window = new Kinetic.Group();

	// Background
	haplo_window.add( new Kinetic.Rect({
		width: window.innerWidth,
		height: window.innerHeight,
		fill: 'black',
		opacity: 0.5
	}));

	// White Rect
	var white_rect = new Kinetic.Group();

	white_rect.add( new Kinetic.Rect({
		x: min_pos.x,
		y: max_pos.y,
		width: max_pos.x - min_pos.x,
		height: max_pos.y - min_pos.y,
		fill: 'white'
	}));

	// Button
	white_rect.add(
		addButton("align", 0, 100, function(){
			alignSelection( haplo_group_nodes, haplo_group_lines);
		})
	);

	// Add rendered lines
	white_rect.add(	render_group );

	haplo_window.add(white_rect);

	console.log(haplo_window);

	haplo_layer.add(haplo_window);

	main_layer.draw();
	haplo_layer.draw()
}


