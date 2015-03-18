
var markerInstance = null;

// Updated by functions, instead of continuously checking
var last_input1_posy, last_input1_ind,
	last_input2_posy, last_input2_ind,
	rangeline_pos;


// I bar group, and inputs
var slwin_group,
	sl_input1,
	sl_input2;

// var marker_array = (function(){
// 	var num = 1000;
// 	var array = [];
// 	while (num-- > 0){
// 		var rand = Math.floor( Math.random() * 1000000 ),
// 			str = 'rs'+rand;

// 		array.push( str );
// 	}
// 	return array;
// })();


function makeSlider(xer, yer)
{
	// Already one present?
	if (markerInstance !== null)
		return markerInstance;



	function makeInputSlider(w, h, top){

		var input_group = new Kinetic.Group({
			x: 0, y:0,
			draggable: true,
			dragBoundFunc: inputDragFunc
		})

		var mark_label = new Kinetic.Text({
			x: 5, y: -h,
			text: "",
			fontFamily: "Arial",
			fontSize: 10,
			fill: 'black'
		});

		input_group.on('mouseup', updateHaploPositions);

		input_group.add(mark_label);

		input_group.message = mark_label; 		// Accessor
		input_group.isTop = top;


		return input_group;
	}


	var marker_slider = new Kinetic.Group({x:xer,y:yer,draggable:true});
	markerInstance = marker_slider;

	//Range line
	var rangeline = new Kinetic.Line({
		x:0,y:0,
		stroke: 'red',
		strokeWidth: 5,
		lineCap: 'round',
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


	slwin_group.on('mouseup', updateHaploPositions);


	var	slwin_lin = new Kinetic.Line({
			x:0, y:0,
			stroke: 'black',
			strokeWidth:2,
			points:[0,0,0,slider_height]
		}),
		slwin_tex = new Kinetic.Text({
			x: slideinp_w/2, y: slider_height/2,
			text: "win",
			fontFamily: "Arial",
			fontSize: 10,
			fill: 'black'
		});

	slwin_group.add( slwin_lin );
	slwin_group.add( slwin_tex );

	// Easy accessors
	slwin_group.line = slwin_lin;
	slwin_group.message = slwin_tex;


	//Inputs
	sl_input1 = makeInputSlider( slideinp_w, slideinp_h, true),
	sl_input2 = makeInputSlider( slideinp_w, slideinp_h, false);

	sl_input2.setY(slider_height);

	rangeline_pos = {x: xer, y:yer};
	last_input1_posy = yer;
	last_input2_posy = yer + slider_height;

	marker_slider.add( rangeline   );
	marker_slider.add( sl_input1   );
	marker_slider.add( sl_input2   );
	marker_slider.add( slwin_group );

	return marker_slider;
}



// var mark_group = makeSlider(350, 10);

// layer.add(mark_group);
// stage.add(layer);

// updateInputs(0, slider_height);
// updateSlide();
// layer.draw();
