

var HaploWindow = {

	_group : new Kinetic.Group(), // haplo_window
	_top : new Kinetic.Group(),   // haplo_window.top
	_bottom : null,               // haplo_window.bottom
	_background : null,			  // haplo_window.background

	_minpos : null,
	_maxpos : null,

	min_node_placement_y : 0,
	left_margin_x : 0,
	white_margin : 20,
	y_margin : 0,

	destroy : function stopHaplomode(){

		HaploWindow.toggleBottomBox(false, function(){

			for (var fid in SelectionMode._ids){
				for (var id in SelectionMode._ids[fid]){
					
					var perc_gfx =  uniqueGraphOps.getFam(fid).nodes[id].graphics;
					var old_pos = perc_gfx.main_layer_pos;
					var old_group = perc_gfx.main_layer_group;
					
					// alert("here1");
					perc_gfx.remove();
					perc_gfx.listening( true );

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

			SelectionMode.destroy();
		});
		// main_layer.draw();
	},

	
	init: function launchHaplomode()
	{
		SelectionMode.markSelecteds();

		if (SelectionMode.noneSelected()){
			SelectionMode.destroy();
			return;
		}

		var line_data = findDOSinSelection( SelectionMode._ids_map );

		HaploWindow._makeMainWindow( line_data );
	},


	_makeMainWindow : function( lines_nodes_to_render )
	{
		var res = mapLinesAndNodes( lines_nodes_to_render ); // DOS.js

		var line_points = res.lp,
			slot_array = res.sa;

		haplo_layer.add( HaploWindow._group );

		// Background
		HaploWindow._background = new Kinetic.Rect({
			width: window.innerWidth,
			height: window.innerHeight,
			fill: 'black',
			opacity: 0.5
		});

		HaploWindow._group.add( HaploWindow._background )

		//DOS.js
		var box_lims_and_group = render( line_points, slot_array,
			function(render_group)
			{
				// After nodes have moved, they are then popped
				// off SelectionMode._select_group, and added to haplo_window_top
				console.log("boxlim=", box_lims_and_group);
				HaploWindow._makeTop( box_lims_and_group, render_group );
			}
		);
	},


	_makeTop( box_lims_and_group, render_group){
		min_pos = box_lims_and_group.min,
		max_pos = box_lims_and_group.max;

		// Share y position with aligment.js
		HaploWindow.min_node_placement_y = min_pos.y;

		// White Rect
		HaploWindow._top.setPosition(
			// {x:min_pos.x - HaploWindow.white_margin, y: min_pos.y - HaploWindow.white_margin} 
			{x: initial_group_node_offset.x + (min_pos.x - HaploWindow.white_margin),
			 y: initial_group_node_offset.y + (min_pos.y - HaploWindow.white_margin)}
		);

		HaploWindow._top.rect = addWhiteRect({
			width: (max_pos.x - min_pos.x),
			height: (max_pos.y - min_pos.y) + 3*HaploWindow.white_margin
		});

		HaploWindow._top.add( HaploWindow._top.rect );

		// Exit button
		HaploWindow._top.exit = addExitButton(
			{x: max_pos.x - HaploWindow.white_margin,
			 y: 0},
			 stopHaplomode);

		HaploWindow._top.add( HaploWindow._top.exit);


		// Add rendered lines
		render_group.remove();
		HaploWindow._top.add( render_group );
		render_group.setY(-HaploWindow._top.getY());
		render_group.setX(-HaploWindow._top.getX() + 10);

		HaploWindow._group.add(HaploWindow._top);

		kineticTween({
			node: HaploWindow._top,
			x: HaploWindow.left_margin_x,
			y: HaploWindow.white_margin,
			duration:0.2,
			onFinish: function(){
				HaploWindow._toggleBottom(true,
					ToolSetModes.setToHaploMode);
			}
		}).play()

		main_layer.draw();
		haplo_layer.draw();	
	},

	_toggleBottom: function( show, finishfunc){
		HaploWindow.y_margin = 30;
		HaploWindow["__"+(show?"show":"hide")+"Bottom"](finishfunc);
	},


	__showBottom: function(finishfunc = 0){
		HaploWindow._bottom = null; // delete old
		
		//Scroll window
		HaploWindow._bottom = new Kinetic.Group({
			x:HaploWindow._top.getX() ,
			y:HaploWindow._top.rect.getHeight() + HaploWindow.y_margin,
			id:"scroll_panel"
		});

		HaploWindow._bottom.rect = addWhiteRect({
			height: 0,
			width: HaploWindow._top.rect.getWidth()
		});

		
		// Expand Top box
		HaploWindow._bottom.add( HaploWindow._bottom.rect );
		HaploWindow._group.add( HaploWindow._bottom );
		HaploWindow._bottom.setZIndex(503);

		kineticTween({
			node: HaploWindow._bottom.rect,
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
					haplo_layer.draw();
				});

				uniqueGraphOps.haplo_scroll = HaploWindow._bottom;
				uniqueGraphOps.haplo_area = scroll_area__;

				HaploWindow._bottom.add( scroll_area__ );

				addHaplosAnyone( SelectionMode._ids );

				if (finishfunc!==0) {
					finishfunc();
				}
			}
		}).play();
	},

	_hideBottom: function(finishfunc = 0){
		uniqueGraphOps.haplo_area.hide();

		kineticTween({
			node: HaploWindow._bottom.rect,
			height:0,
			onFinish: function(){
				HaploWindow._bottom.destroyChildren();	//Bit of genocide
				HaploWindow._bottom.destroy();	
				if (finishfunc!==0){
					finishfunc();
				}
			}
		}).play();
	}
}