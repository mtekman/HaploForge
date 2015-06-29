// Haplomode is launched from here
var selected_ids_map = {}, // Generational map
	selected_ids = {};	   // Just a map of ids

var haplo_window = new Kinetic.Group();
haplo_window.top = new Kinetic.Group(),
haplo_window.bottom;

var min_node_placement_y = 0;
var left_margin_x = 100;

var white_margin = 20;

function stopHaplomode(){
	
}

function launchHaplomode()
{
	function grabSelecteds(){
		var idmap = {}
		var pure_ids = {}

		for (var fam_pid in selection_items){
		  	var item = selection_items[fam_pid];

		 	if (!item.selected) continue;
		 	
		 	var fam = fam_pid.split("_")[0],
		 		pid = fam_pid.split("_")[1];

		 	if (!(fam in idmap)){
		 		idmap[fam] = {}; // generations, key first - array later
		 		
		 		pure_ids[fam] = {};
		 	}
		 	pure_ids[fam][pid] = 1;

		 	//Hopefully these are at the same level with few discrepencies
		 	var generation = item.graphics.getY()

		 	idmap[fam][generation] = idmap[fam][generation] || [];
		 	idmap[fam][generation].push( pid );
		 }

		for (var fam in idmap)
			idmap[fam] = map2orderedArray( idmap[fam] )

		return {id_map_generational: idmap, id_map:pure_ids};
	};

	var selecteds = grabSelecteds();

	selected_ids_map = selecteds.id_map_generational;
	selected_ids = selecteds.id_map

	var line_data = findDOSinSelection( selected_ids_map );

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
		function(render_group)
		{
			makeTopBox_haplomode( box_lims_and_group, render_group );
		}
	);
}


function makeTopBox_haplomode( box_lims_and_group, render_group){
	min_pos = box_lims_and_group.min,
	max_pos = box_lims_and_group.max;

	// Share y position with aligment.js
	min_node_placement_y = min_pos.y;

	// White Rect
	haplo_window.top.setPosition(
		{x:min_pos.x - white_margin, y: min_pos.y - white_margin} );

	haplo_window.top.rect = addWhiteRect({
		width: (max_pos.x - min_pos.x),
		height: (max_pos.y - min_pos.y) + 3*white_margin
	});

	haplo_window.top.add( haplo_window.top.rect );

	// Align Button
	haplo_window.add(
		addButton("align", 0, 0, function(){
			alignTopSelection( haplo_group_nodes, haplo_group_lines);
		})
	);
	// JS detaches toggler from function inherently
	var haplotypes_toggled = false;

	haplo_window.add(
		addButton("haplos", 0, butt_h, function()
		{
			haplotypes_toggled = !haplotypes_toggled;

			toggleBottomBox(haplotypes_toggled);
		})
	);


	// Add rendered lines
	render_group.remove();
	haplo_window.top.add(	render_group );
	render_group.setY(-haplo_window.top.getY());

	haplo_window.add(haplo_window.top);

	(new Kinetic.Tween({
		node: haplo_window.top,
		x: left_margin_x,
		y: white_margin,
		duration:0.2
	})).play();

	main_layer.draw();
	haplo_layer.draw();	
}



function toggleBottomBox( show )
{
	haplo_window.y_margin = 30;

	console.log("sel_ids=", selected_ids_map)

	if (show)
	{
		delete haplo_window.bottom;

		//Scroll window
		haplo_window.bottom = new Kinetic.Group({
			x:haplo_window.top.getX(),
			y:haplo_window.top.rect.getHeight() + haplo_window.y_margin,
			id:"scroll_panel",
		});

		haplo_window.bottom.rect = addWhiteRect({
			height: 0,
			width: haplo_window.top.rect.getWidth()
		});


		
		// Expand Top box
		haplo_window.bottom.add( haplo_window.bottom.rect );
		haplo_window.add( haplo_window.bottom );

		// Add haplotypes
		// var haplo_group = addHaploScreen(
		// 	haplo_window.top.rect.getWidth(),
		// 	500,
		// 	selected_ids_map
		// );


		/* 
		Here I'm essentially pointing at haplomode_frontend.js
		
		I dont need to do much - haploblock_frontend scripts
		only require:
			* unique_graph_objs.haplo_scroll
			* unique_graph_objs.haplo_area

		haplo_scroll is the .main_box (scroll_window):
		 	group, scroll window that stays stationary

		haplo_area is .scrollable (scroll_area__):
			group (child of haplo_scroll), draggable haplotypes

		It is also worth noting that the main white rect is a child of
		haplo_scroll (stack the existing).
		*/

		// Space for haplotypes to be rendered
		//

		// Where HTs are grouped

		kineticTween({
			node: haplo_window.bottom.rect,
			height: (3+HAP_DRAW_LIM) * HAP_VERT_SPA,
			onFinish: function(){
		
				var scroll_area__ = new Kinetic.Group({
					draggable:true,
					dragBoundFunc: function(pos){
						var group_loc = this.parent.getAbsolutePosition();

						return {
							x: group_loc.x,
							y: group_loc.y + (Math.floor((pos.y - group_loc.y)/ HAP_VERT_SPA) * HAP_VERT_SPA)
						};
					}
				});
			
				scroll_area__.on('mouseup', function(){
					redrawHaplos(false); // starting=300
					updateInputsByIndex( sta_index, end_index );
					updateSlide();
					mscale_layer.draw();
				});

				unique_graph_objs.haplo_scroll = haplo_window.bottom;
				unique_graph_objs.haplo_area = scroll_area__;

				haplo_window.bottom.add( scroll_area__ );

				addHaplosAnyone( selected_ids )
;				unique_graph_objs.parent.show();
			}
		}).play();

	}
	else {
		unique_graph_objs.haplo_area.hide();

		kineticTween({
			node: haplo_window.bottom.rect,
			height:0,
			onFinish: function(){
				haplo_window.bottom.destroyChildren();	//Bit of genocide
				haplo_window.bottom.destroy();
			}
		}).play();
	}

	haplo_layer.draw();

}