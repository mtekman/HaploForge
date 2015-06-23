// Haplomode is launched from here
var haplo_window = new Kinetic.Group();
var white_rect = new Kinetic.Group(); //global


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
	var res = mapLinesAndNodes( lines_nodes_to_render );

	var line_points = res.lp,
		slot_array = res.sa;

	haplo_layer.add( haplo_window );

	// Background
	haplo_window.add( new Kinetic.Rect({
		width: window.innerWidth,
		height: window.innerHeight,
		fill: 'black',
		opacity: 0.5
	}));


	var min_pos, max_pos;

	var box_lims_and_group = render( line_points, slot_array, function( render_group ){
		render_group.remove();

		min_pos = box_lims_and_group.min,
		max_pos = box_lims_and_group.max;

		console.log( "box_lims", box_lims_and_group);

		// White Rect
		// white_rect.setX( min_pos.x ); white_rect.setY( min_pos.y );

		var margin = 20;

		white_rect.add( new Kinetic.Rect({
			x: min_pos.x - margin,
			y: min_pos.y - margin,
			width: (max_pos.x - min_pos.x) + margin,
			height: (max_pos.y - min_pos.y) + 3*margin,
			fill: 'white'
		}));

		// Button
		haplo_window.add(
			addButton("align", 0, 0, function(){
				alignSelection( haplo_group_nodes, haplo_group_lines);
			})
		);

		// Add rendered lines
		white_rect.add(	render_group );
		haplo_window.add(white_rect);

		(new Kinetic.Tween({
			node: white_rect,
			x: 50,
			y: -50,
			duration:1
		})).play();

		main_layer.draw();
		haplo_layer.draw();
	});
}


