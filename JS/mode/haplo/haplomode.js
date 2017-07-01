

var HaploWindow = {

	_left: new Kinetic.Rect({    //  side bar underlying markers
		x: 10, 
		y: 95,
		height: 100,
		width: 65,
		fill: 'white',
		shadowColor: 'white',
		shadowBlur: 8,
		cornerRadius: 10,
		opacity: 0.3
	}),


	_group : new Kinetic.Group(), // haplo_window
	_top : new Kinetic.Group(),   // haplo_window.top
	_bottom : null,               // haplo_window.bottom
	_background : null,			  // haplo_window.background

	_minpos : null,
	_maxpos : null,
	_boxlimsandgroup: null,

	min_node_placement_y : 0,
	left_margin_x : 100,
	white_margin : 20,
	y_margin : 0,

	destroy : function stopHaplomode(){

		HaploWindow.__aligntoggle = false; // workaround for alignment issue on re-entering mode

		HaploModeEvents._removeMouseWheel();

		HaploWindow._toggleBottom(false, function(){

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
			// KILL THEM, MWAAHAHA -- it's 5amm....
//			haplo_layer.remove( HaploWindow._background );
			HaploWindow._group.destroyChildren();
			HaploWindow._group.destroy();
			HaploWindow._background = null;
			HaploWindow._bottom = null;

			haplo_layer.destroyChildren();
			haplo_layer.draw();

			SelectionMode.destroy();
			ButtonModes.setToHaploView();
		});
	},

	
	init: function launchHaplomode()
	{
		SelectionAction.reset();	
		SelectionMode.markSelecteds();

		if (SelectionMode.noneSelected()){
			utility.notify("Error", "Please select some individuals")
//			SelectionMode.destroy();
//			HaploWindow.destroy();
//			main_layer.draw();
			return;
		}

		SelectionMode._exit.hide();

		var line_data = findDOSinSelection( SelectionMode._ids_map );

		HaploWindow._makeMainWindow( line_data );
		HaploWindow._compensateOffset();
	},

	_compensateOffset : function()
	{
		let stage_pos = stage.getPosition(),
			left_x  = HaploWindow._left.getX() - 5;


		HaploWindow._group.setX( -stage_pos.x - left_x);
		HaploWindow._group.setY( -stage_pos.y );

		HaploWindow._background.setX( -stage_pos.x );
		HaploWindow._background.setY( -stage_pos.y );

		//HaploWindow._exit.setX(20 - left_x);
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

		haplo_layer.add( HaploWindow._background )
		HaploWindow._background.setZIndex(-20);

		//DOS.js
		DOS.render( line_points, slot_array, 
			// After nodes have moved, they are then popped
			// off SelectionMode._select_group, and added to haplo_window_top
			HaploWindow._makeTop
		);
	},

	// cs + cs + mu + to + ca + ca + ba = 100 + 100 + 100 + 40 + 60 + 60 + 100 = 560
	// pi + ch + fi + sa + ol = 120 + 80 + 80 + 20 + 20 = 320 
	// 880


	_makeTop(){
		var render_group = DOS.group;
		var min_pos = DOS.min,
			max_pos = DOS.max;

		// Share y position with aligment.js
		HaploWindow.min_node_placement_y = min_pos.y;
		HaploWindow._minpos = min_pos;
		HaploWindow._maxpos = max_pos;

		// White Rect
		HaploWindow._top.setPosition(
			// {x:min_pos.x - HaploWindow.white_margin, y: min_pos.y - HaploWindow.white_margin} 
			{x: DOS.initial_group_node_offset.x + (min_pos.x - HaploWindow.white_margin),
			 y: DOS.initial_group_node_offset.y + (min_pos.y - HaploWindow.white_margin)}
		);

		HaploWindow._top.rect = addWhiteRect({
			width: (max_pos.x - min_pos.x),
			height: (max_pos.y - min_pos.y) + 3*HaploWindow.white_margin
		});

		HaploWindow._top.add( HaploWindow._top.rect );

		// Exit button
		HaploWindow._exit = addExitButton(
			{x: 20 + HaploWindow._left.getX(),
			 y: 20},
			 HaploWindow.destroy,
			 2);

		HaploWindow._group.add( HaploWindow._exit );


		// Add rendered lines
		render_group.remove();
		HaploWindow._top.add( render_group );
		render_group.setY(-HaploWindow._top.getY());
		render_group.setX(-HaploWindow._top.getX() + 10);

		HaploWindow._group.add(HaploWindow._top);

		ButtonModes.setToComparisonMode();
		
		kineticTween({
			node: HaploWindow._top,
			x: HaploWindow.left_margin_x,
			y: HaploWindow.white_margin,
			duration:0.2,
			onFinish: function(){
				HaploWindow._toggleBottom(true);
			}
		}).play()

		main_layer.draw();
		haplo_layer.draw();	
	},

	_toggleBottom: function( show, finishfunc){
		HaploWindow.y_margin = 30;

		if (show){
			HaploModeEvents._addMouseWheel();
			HaploModeEvents.addKeys();
			
			HaploWindow.__showBottom( finishfunc );
		} else {
			HaploModeEvents._removeMouseWheel();
			HaploModeEvents.removeKeys();

			HaploWindow.__hideBottom( finishfunc );
		}
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


				scroll_area__.on('mousedown', function(){

					function mouseUp(){
						HaploBlock.redrawHaplos(false); // starting=300
						SliderHandler.updateInputsByIndex();					
						SliderHandler.updateSlide();
						haplo_layer.draw();
						document.removeEventListener("mouseup", mouseUp, false);
					}
					document.addEventListener("mouseup", mouseUp, false);
				});

				HaploWindow._scroll_area = scroll_area__;


				HaploWindow._bottom.add( scroll_area__ );


				HaploWindow._group.add( HaploWindow._left );
				HaploWindow._left.show();
				// second lowest element
				HaploWindow._left.moveToBottom();
				HaploWindow._left.moveUp();

				HaploBlock.init( SelectionMode._ids );

				if (finishfunc!==0) {
					finishfunc();
				}

				MarkerSlider.makeVisible(true)
				Resize.resizeCanvas();
				setTimeout(function(){
					haplo_layer.draw()
				}, 100);
			}
		}).play();
	},

	__hideBottom: function(finishfunc = 0){
		if (HaploWindow._scroll_area !== null){
			HaploWindow._scroll_area.hide();
		}

		if (HaploWindow._bottom === null){
			finishfunc();
			return;
		}

		HaploWindow._left.hide();

		kineticTween({
			node: HaploWindow._bottom.rect,
			height:0,
			onFinish: function(){

				HaploWindow._bottom.destroyChildren();	//Bit of genocide
				HaploWindow._bottom.destroy();
				HaploWindow._bottom = null;

				HaploWindow._exit.destroy();
				HaploWindow._exit = null;

				HaploWindow._group.remove( HaploWindow._left );
				if (finishfunc!==0){
					finishfunc();
				}
				haplo_layer.draw()
			}
		}).play();
	}
}