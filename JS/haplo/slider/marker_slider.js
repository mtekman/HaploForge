var markerInstance = null;

// Updated by functions, instead of continuously checking
var last_input1_posy, last_input1_ind,
	last_input2_posy, last_input2_ind,
	rangeline_pos;


// I bar group, and inputs
var slwin_group,
	sl_input1,
	sl_input2;


/** General wrapper for slider
	Use this if in doubt**/
function showSlider(visible)
{
	var marker_slid = getSlider(
		 haplo_window.top.getX()
		+haplo_window.top.rect.getWidth() + 20, 60);

	if (visible){
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
	return marker_slid;
}


function getSlider(xer, yer)
{
	// Already one present?
	if (markerInstance !== null)
		return markerInstance;


	function makeInputSlider(top)
	{
		var input_group = new Kinetic.Group({
			x: 0, y: 0,
			draggable: true,
			dragBoundFunc: inputDragFunc
		})
		var mark_label = new Kinetic.Text({
			x: I_slider_offset*2, y: (top?-I_slider_extension:I_slider_extension) - HAP_VERT_SPA/2,
			text: "",
			fontFamily: "Arial",
			fontSize: 10,
			fill: 'black'
		});
		var line_out = new Kinetic.Line({
			points: [
				I_slider_offset,0,
				I_slider_offset,top?-I_slider_extension:I_slider_extension,
				I_slider_offset*2,top?-I_slider_extension:I_slider_extension
					],
			stroke: slider_style.I_stroke,
			strokeWidth:slider_style.I_strokeWidth
		});
		input_group.on('mouseup', function(){updateHaploPositions(true)});

		input_group.add(mark_label);
		input_group.add(line_out);

		input_group.message = mark_label; 		// Accessor
		input_group.isTop = top;

		return input_group;
	}



	var marker_slider = new Kinetic.Group({x:xer,y:yer,draggable:true});
	markerInstance = marker_slider;

	//Range line
	var rangeline = new Kinetic.Line({
		x:0,y:0,
		stroke: slider_style.R_stroke,
		strokeWidth: slider_style.R_strokeWidth,
		lineCap: slider_style.R_cap,
		points: [0,0,0,slider_height]
	});

	// Update all input positions
	rangeline.on('mouseup', function (e){
		rangeline_pos = this.getAbsolutePosition();
		last_input1_posy = sl_input1.getAbsolutePosition().y;
		last_input2_posy = sl_input2.getAbsolutePosition().y;
	});

	// Sliding Window
	slwin_group = new Kinetic.Group({
		draggable:true,
		dragBoundFunc: sliderDragFunc
	});


	slwin_group.on('mousedown', function(){haplo_layer.disableHitGraph()});
	slwin_group.on('dragmove', function(){
		if (HAP_DRAW_LIM < HAP_MIN_DRAW)
			updateHaploPositions();

	});
	slwin_group.on('mouseup', function(){
		haplo_layer.enableHitGraph();
		updateHaploPositions();
	});


	var	slwin_lin = new Kinetic.Line({
			x:0, y:0,
			stroke: slider_style.I_stroke,
			strokeWidth: slider_style.I_strokeWidth,
			points:[0,0,0,slider_height]
		}),
		slwin_tex = new Kinetic.Text({
			x: slideinp_w/2, y: slider_height/2,
			text: "win",
			fontFamily: slider_style.I_fontFamily,
			fontSize: slider_style.I_fontSize,
			fill: slider_style.I_fontColor
		});

	slwin_group.add( slwin_lin );
	slwin_group.add( slwin_tex );

	// Easy accessors
	slwin_group.line = slwin_lin;
	slwin_group.message = slwin_tex;


	//Inputs
	sl_input1 = makeInputSlider(true),
	sl_input2 = makeInputSlider(false);

	sl_input2.setY(slider_height);

	rangeline_pos = {x: xer, y:yer};
	last_input1_posy = yer;
	last_input2_posy = yer + slider_height;

	marker_slider.add( rangeline   );
	marker_slider.add( sl_input1   );
	marker_slider.add( sl_input2   );
	marker_slider.add( slwin_group );

	marker_slider.rangeline = rangeline;

	return marker_slider;
}


// marker_array = (function(){
// 	var num = 1000;
// 	var array = [];
// 	while (num-- > 0){
// 		var rand = Math.floor( Math.random() * 1000000 ),
// 			str = 'rs'+rand;

// 		array.push( str );
// 	}
// 	return array;
// })();

// var mark_group = getSlider(350, 10);
// var stage = new Kinetic.Stage({
// 	container:'container',
// 	width: window.innerWidth,
// 	height: window.innerHeight
// });
// var layer = new Kinetic.Layer({});
// layer.add(mark_group);
// stage.add(layer);

// updateInputs(0, slider_height);
// updateSlide();
// layer.draw();
