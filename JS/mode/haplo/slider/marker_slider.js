
var MarkerSlider = {

	_instance : null, //markerInstance
	_visible : false, //markerscale_visible

	// Updated by functions, instead of continuously checking
	_last_input1_posy : null,
	_last_input2_posy : null,

	_last_input1_ind : null,
	_last_input2_ind : null,
	_rangeline_pos : null,

	// I bar group, and inputs
	_slwin_group : null,
	_sl_input1 : null,
	_sl_input2 : null,

	/** General wrapper for slider
		Use this if in doubt**/
	showSlider: function(visible)
	{
		MarkerSlider._visible = visible;

		var marker_slid = MarkerSlider.getSlider(
			 HaploWindow._top.getX()
			+HaploWindow._top.rect.getWidth() + 20, 60);

		if (MarkerSlider._visible)
		{
			haplo_layer.add(marker_slid)

			updateInputsByIndex(0, HAP_DRAW_LIM);
			updateSlide();
		}
		else {
			marker_slid.remove();
		}
		haplo_layer.draw();
		return marker_slid;
	},

	getSlider: function(xer, yer)
	{
		// Already one present?
		if (MarkerSlider._instance === null){
			MarkerSlider._instance = MarkerSlider._makeSlider(xer,yer);
		}
		return MarkerSlider._instance;
	},


	__makeInputSlider: function(top = false)
	{
		var input_group = new Kinetic.Group({
			x: 0, y: 0,
			draggable: true,
			dragBoundFunc: inputDragFunc
		});

		var mark_label = new Kinetic.Text({
			x: slider_style.bevel + 3 + I_slider_offset*2,
			y: (top?-I_slider_extension:I_slider_extension) - HAP_VERT_SPA/2,
			text: "",
			fontFamily: "Arial",
			fontSize: 10,
			fill: slider_style.S_fontColor
		});

		var line_out = new Kinetic.Line({
			points: [
				0, slider_style.bevel,
				I_slider_offset + slider_style.bevel,0,
				I_slider_offset + slider_style.bevel ,top?-I_slider_extension:I_slider_extension,
				slider_style.bevel + I_slider_offset*2,top?-I_slider_extension:I_slider_extension
					],
			stroke: slider_style.I_stroke,
			strokeWidth:slider_style.I_strokeWidth
		});

		input_group.on('mouseup', function(){
			updateHaploPositions(true);
		});

		input_group.add(mark_label);
		input_group.add(line_out);

		input_group.message = mark_label; // Accessor
		input_group.isTop = top;

		return input_group;
	},

	_makeSlider: function(xer,yer){
		var marker_slider = new Kinetic.Group({x:xer,y:yer,draggable:true});
		MarkerSlider._instance = marker_slider;

		//Range line
		var rangeline = new Kinetic.Line({
			x:0,y: slider_style.bevel,
			stroke: slider_style.R_stroke,
			strokeWidth: slider_style.R_strokeWidth,
			lineCap: slider_style.R_cap,
			points: [0,0,0,slider_height]
		});

		//Highlight
		marker_slider.on("mouseover", function(){
			rangeline.setStroke('blue');
			haplo_layer.draw();
		});

		//Highlight
		marker_slider.on("mouseout", function(){
			rangeline.setStroke('red');
			haplo_layer.draw();
		});


		// Update all input positions
		rangeline.on('mouseup', function (e){
			MarkerSlider._rangeline_pos = this.getAbsolutePosition();
			MarkerSlider._last_input1_posy = MarkerSlider._sl_input1.getAbsolutePosition().y;
			MarkerSlider._last_input2_posy = MarkerSlider._sl_input2.getAbsolutePosition().y;
		});

		// Sliding Window
		MarkerSlider._slwin_group = new Kinetic.Group({
			draggable:true,
			dragBoundFunc: sliderDragFunc
		});

		MarkerSlider._slwin_group.on('dragmove', function(){
			if (HAP_DRAW_LIM < HAP_MIN_DRAW)
				updateHaploPositions();
		});
		
		MarkerSlider._slwin_group.on('mouseup', function(){
			updateHaploPositions();
		});

		var	slwin_lin = new Kinetic.Line({
				x:0, y:0,
				stroke: slider_style.I_stroke,
				strokeWidth: slider_style.I_strokeWidth,
				points:[0,0,0,slider_height]
			}),

			slwin_tex = new Kinetic.Text({
				x: slider_style.bevel + slideinp_w/2,
				y: slider_height/2,
				text: "win",
				fontFamily: slider_style.I_fontFamily,
				fontSize: slider_style.I_fontSize,
				fill: slider_style.I_fontColor
			});

		MarkerSlider._slwin_group.add( slwin_lin );
		MarkerSlider._slwin_group.add( slwin_tex );

		// Easy accessors
		MarkerSlider._slwin_group.line = slwin_lin;
		MarkerSlider._slwin_group.message = slwin_tex;

		//Inputs
		MarkerSlider._sl_input1 = MarkerSlider.__makeInputSlider(true),
		MarkerSlider._sl_input2 = MarkerSlider.__makeInputSlider(false);
		MarkerSlider._sl_input2.setY(slider_height);

		MarkerSlider._rangeline_pos = {x: xer, y:yer};
		MarkerSlider._last_input1_posy = yer;
		MarkerSlider._last_input2_posy = yer + slider_height;

		marker_slider.add( rangeline   );
		marker_slider.add( MarkerSlider._sl_input1   );
		marker_slider.add( MarkerSlider._sl_input2   );
		marker_slider.add( MarkerSlider._slwin_group );

		marker_slider.rangeline = rangeline;

		return marker_slider;
	}
}