var last_input1_posy, last_input1_ind,
	last_input2_posy, last_input2_ind,
	rangeline_pos;

var slwin_group,
	sl_input1,
	sl_input2;

var marker_array = (function(){
	var num = 1000;
	var array = [];
	while (num-- > 0){
		var rand = Math.floor( Math.random() * 1000000 ),
			str = 'rs'+rand;

		array.push( str );
	}
	return array;
})();


function makeSlider(xer, yer)
{
	console.log("making slider");

	function makeInputSlider(w, h, top){

		var input_group = new Kinetic.Group({
			x: 0, y:0,
			draggable: true,
			dragBoundFunc: inputDragFunc
		})

// 		var rect = new Kinetic.Rect({
// 			width: -w, height:-h,
// 			fill: 'green',
// 			stroke: 'black', strokeWidth: 2
// 		});

		var mark_label = new Kinetic.Text({
			x: 5, y: -h,
			text: "mark1",
			fontFamily: "Arial",
			fontSize: 10,
			fill: 'black'
		});

		input_group.message = mark_label; 		// Accessor

// 		input_group.add(rect);
		input_group.add(mark_label);
		input_group.isTop = top;

		return input_group;
	}


	var marker_slider = new Kinetic.Group({x:xer,y:yer,draggable:true});

	//Range line
	var rangeline = new Kinetic.Line({
		x:0,
		y:0,
		stroke: 'red',
		strokeWidth: 3,
		points: [0,0,0,slider_height]
	});

	rangeline.on('mouseup', function (e){
		rangeline_pos = this.getAbsolutePosition();
	});

	// Sliding Window
	slwin_group = new Kinetic.Group({
		draggable:true,
		dragBoundFunc: sliderDragFunc
	});

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

	marker_slider.add( rangeline );
	marker_slider.add( sl_input1 );
	marker_slider.add( sl_input2 );
	marker_slider.add( slwin_group );

	return marker_slider;
}


var stage = new Kinetic.Stage({
	container:'container',
	width: 600,
	height:600
});

var layer = new Kinetic.Layer({})

var mark_group = makeSlider(150, 200);

layer.add(mark_group);
stage.add(layer);
