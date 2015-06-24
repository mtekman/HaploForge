// Haplomode is launched from here
var haplo_window = new Kinetic.Group();
var white_rect = new Kinetic.Group({draggable:true}); //global

var min_node_placement_y = 0;
var left_margin_x = 100;

var white_margin = 20;

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

	var box_lims_and_group = render( line_points, slot_array,
		function(render_group){
			makeTopBox_haplomode( box_lims_and_group, render_group,
			 slot_array //unused, but passed onto makeBottomBox)
		}
	);
}


function makeTopBox_haplomode( box_lims_and_group, render_group, slot_array ){
	min_pos = box_lims_and_group.min,
	max_pos = box_lims_and_group.max;

	// Share y position with aligment.js
	min_node_placement_y = min_pos.y;

	// White Rect
	white_rect.setPosition(
		{x:min_pos.x - white_margin, y: min_pos.y - white_margin} );

	white_rect.box = new Kinetic.Rect({
		width: (max_pos.x - min_pos.x),
		height: (max_pos.y - min_pos.y) + 3*white_margin,
		fill: 'white'
	});

	white_rect.add( white_rect.box );

	// Align Button
	haplo_window.add(
		addButton("align", 0, 0, function(){
			alignTopSelection( haplo_group_nodes, haplo_group_lines);
		})
	);
	// JS detaches toggler from function inherently
	var haplotypes_toggled = true;

	haplo_window.add(
		addButton("haplotypes", 0, butt_h, function()
		{
			haplotypes_toggled = !haplotypes_toggled;

			toggleBottomBox(
				haplotypes_toggled, 
				white_rect.box, // for aligning with lower box
				slot_array
			);
		})
	);


	// Add rendered lines
	render_group.remove();
	white_rect.add(	render_group );
	render_group.setY(-white_rect.getY());

	haplo_window.add(white_rect);

	(new Kinetic.Tween({
		node: white_rect,
		x: left_margin_x,
		y: white_margin,
		duration:0.2
	})).play();

	main_layer.draw();
	haplo_layer.draw();	
}



function toggleBottomBox( show, top_box, haplotype_ids){

	if (show){

	}

}


function makeBottomBox_haplomode( )