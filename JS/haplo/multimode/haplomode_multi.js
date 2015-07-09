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

	toggleBottomBox(false, function(){

		for (var fid in selected_ids){
			for (var id in selected_ids[fid]){
				
				var perc_gfx =  unique_graph_objs[fid].nodes[id].graphics;
				var old_pos = perc_gfx.main_layer_pos;
				var old_group = perc_gfx.main_layer_group;
				
				// alert("here1");
				perc_gfx.remove();
				old_group.add(perc_gfx);

				// haplo_layer.draw();
				// main_layer.draw();
				// alert("here2");

				perc_gfx.setPosition({
					x: perc_gfx.getX() - old_group.getX(),
					y: perc_gfx.getY() - old_group.getY()
				});

				// haplo_layer.draw();
				// main_layer.draw();
				// alert("here3");

				(kineticTween({
					node: perc_gfx,
					x: old_pos.x,
					y: old_pos.y
				})).play();
			}
		}

		haplo_layer.destroyChildren();
		haplo_layer.draw();

		stopSelectionMode();
	});
	// main_layer.draw();
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

	console.log(selected_ids, selected_ids )

	if (isEmpty(selected_ids)){
		return stopSelectionMode();
		// haplo_layer.draw();
		// return main_layer.draw();
	}


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
	haplo_window.background = new Kinetic.Rect({
		width: window.innerWidth,
		height: window.innerHeight,
		fill: 'black',
		opacity: 0.5
	});

	haplo_window.add( haplo_window.background )


	var min_pos, max_pos;

	var box_lims_and_group = render( line_points, slot_array,
		function(render_group)
		{
			// After nodes have moved, they are then popped
			// off select_group, and added to haplo_window_top
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
		// {x:min_pos.x - white_margin, y: min_pos.y - white_margin} 
		{x: initial_group_node_offset.x + (min_pos.x - white_margin),
		 y: initial_group_node_offset.y + (min_pos.y - white_margin)}
	);

	haplo_window.top.rect = addWhiteRect({
		width: (max_pos.x - min_pos.x),
		height: (max_pos.y - min_pos.y) + 3*white_margin
	});

	haplo_window.top.add( haplo_window.top.rect );

	// Exit button
	haplo_window.top.add( addExitButton(
		{x: max_pos.x - white_margin,
		 y: 0},
		 stopHaplomode)
	);

	// Align Button
	haplo_window.add(
		addButton("Align Pedigree", 0, 0, function(){
			alignTopSelection( haplo_group_nodes, haplo_group_lines);
		})
	);


	// // JS detaches toggler from function inherently
	// var haplotypes_toggled = false;

	// haplo_window.add(
	// 	addButton("haplos", 0, butt_h, function()
	// 	{
	// 		haplotypes_toggled = !haplotypes_toggled;

	// 		toggleBottomBox(haplotypes_toggled);
	// 	})
	// );

	// Add rendered lines
	render_group.remove();
	haplo_window.top.add(	render_group );
	render_group.setY(-haplo_window.top.getY());
	render_group.setX(-haplo_window.top.getX() + 10);

	haplo_window.add(haplo_window.top);

	(new Kinetic.Tween({
		node: haplo_window.top,
		x: left_margin_x,
		y: white_margin,
		duration:0.2,
		onFinish: function(){
			toggleBottomBox(true);
		}
	})).play();

	main_layer.draw();
	haplo_layer.draw();	
}



function toggleBottomBox( show, finishfunc )
{

	finishfunc = finishfunc || 0;

	console.log(finishfunc);

	haplo_window.y_margin = 30;

	console.log("sel_ids=", selected_ids_map)

	var toggle_zoommarkers = false;

	if (show)
	{
		delete haplo_window.bottom;
		
		//Add Zoom button
		haplo_window.zoom_button = addButton("Range Slider", 0, butt_h,
				function(){

					toggle_zoommarkers = !toggle_zoommarkers;
					console.log("zooming", toggle_zoommarkers);
					//Within Haplomode

					var marker_slid = getSlider(window.innerWidth - 100, 60);

					if (toggle_zoommarkers){
						mscale_layer.add(marker_slid);
						// mscale_layer.setZIndex()
						// stage.add(mscale_layer);

						updateInputsByIndex(0, HAP_DRAW_LIM);
						updateSlide();
					}
					else {
						// mscale_layer.destroyChildren();
						// stage.remove(mscale_layer);
						marker_slid.remove();
					}
					mscale_layer.draw();
				}
		);

		haplo_window.add( haplo_window.zoom_button );;


		//Scroll window
		haplo_window.bottom = new Kinetic.Group({
			x:haplo_window.top.getX() ,
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
		haplo_window.bottom.setZIndex(-2);

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

				addHaplosAnyone( selected_ids );
				unique_graph_objs.parent.show();

				if (finishfunc!==0) finishfunc();
			}
		}).play();

	}
	else {
		haplo_window.zoom_button.destroy();
		delete haplo_window.zoom_button;

		unique_graph_objs.haplo_area.hide();

		kineticTween({
			node: haplo_window.bottom.rect,
			height:0,
			onFinish: function(){
				haplo_window.bottom.destroyChildren();	//Bit of genocide
				haplo_window.bottom.destroy();
				if (finishfunc!==0) finishfunc();
			}
		}).play();

	}


	haplo_layer.draw();

}