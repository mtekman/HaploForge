
var MarkerSlider = {

	_instance : null, //markerInstance

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


	_config : {
		slideinp_w : 20,
		slider_height : window.innerHeight * 0.75,
		I_slider_extension : 35,
		I_slider_offset : 20/3 //slideinp_w/3
	},

	_style : {
		R_stroke:'red',
		R_strokeWidth: 5,
		R_cap:'round',
		I_stroke:'white',
		I_strokeWidth:1.3,
		I_fontFamily: "monospace",
		I_fontSize: 10,
		I_fontColor: 'red',
		S_fontColor: 'white',
		bevel: 0
	},


	makeVisible: function(visible)
	{

		var slider = MarkerSlider._get();

		if (visible){
			haplo_layer.add(slider);

			SliderHandler.updateInputsByIndex();
			SliderHandler.updateSlide();
		}
		else {
			slider.remove();

			// Fuckit, just delete it for now
			MarkerSlider._slwin_group.destroyChildren();
			MarkerSlider._slwin_group.destroy();
			MarkerSlider._sl_input1.destroyChildren();
			MarkerSlider._sl_input1.destroy();
			MarkerSlider._sl_input2.destroyChildren();
			MarkerSlider._sl_input2.destroy();

			MarkerSlider._instance.destroyChildren();
			MarkerSlider._instance.destroy();

			MarkerSlider._instance = null;

		}
		haplo_layer.draw();
	},

	_get(){

		if (MarkerSlider._instance === null){
			MarkerSlider._instance = MarkerSlider._makeSlider(
			 	 HaploWindow._top.getX()
				+HaploWindow._top.rect.getWidth() + 20, 60
			);
		}
		return MarkerSlider._instance;
	},


	__makeInputSlider: function(top = false)
	{
		var ms_c = MarkerSlider._config,
			ms_s = MarkerSlider._style;

		var input_group = new Kinetic.Group({
			x: 0, y: 0,
			draggable: true,
			dragBoundFunc: SliderHandler.inputDragFunc
		});

		var mark_label = new Kinetic.Text({
			x: ms_s.bevel + 3 + ms_c.I_slider_offset*2,
			y: (top?
				-ms_c.I_slider_extension
				:ms_c.I_slider_extension) 
				- HAP_VERT_SPA/2,
			text: "",
			fontFamily: "Arial",
			fontSize: 10,
			fill: ms_s.S_fontColor
		});

		var line_out = new Kinetic.Line({
			points: [
				0, ms_s.bevel,
				ms_c.I_slider_offset + ms_s.bevel,0,
				ms_c.I_slider_offset + ms_s.bevel ,top?
					-ms_c.I_slider_extension
					:ms_c.I_slider_extension,
				ms_s.bevel + ms_c.I_slider_offset*2,top?
					-ms_c.I_slider_extension
					:ms_c.I_slider_extension
					],
			stroke: ms_s.I_stroke,
			strokeWidth:ms_s.I_strokeWidth
		});

//		input_group.mousedown_ypos = null;

		input_group.on('mousedown', function(val){
			input_group.is_being_dragged = true;
			
			// Log only the first mousedown position
/*			if (input_group.mousedown_ypos === null){
				input_group.mousedown_ypos = val.evt.y; //used by inputDragFunc
			}*/

			function uponMouseUp(){
				if (input_group.is_being_dragged){
					SliderHandler.updateHaploPositions(true);
					
					input_group.is_being_dragged = false;
				//	input_group.mousedown_ypos = null;

					document.removeEventListener("mouseup", uponMouseUp, false);

				};
			}
			document.addEventListener("mouseup", uponMouseUp, false);
		});


		if (top){
			input_group.on('mouseover', MouseStyle.changeToVerticalN);
		} else {
			input_group.on('mouseover', MouseStyle.changeToVerticalS);
		}

		input_group.add(mark_label);
		input_group.add(line_out);

		input_group.message = mark_label; // Accessor
		input_group.isTop = top;

		return input_group;
	},

	_makeSlider: function(xer,yer)
	{
		var ms_c = MarkerSlider._config,
			ms_s = MarkerSlider._style;

		var marker_slider = new Kinetic.Group({x:xer,y:yer,draggable:true});
		MarkerSlider._instance = marker_slider;

		//Range line
		var rangeline = new Kinetic.Line({
			x:0,y: ms_s.bevel,
			stroke: ms_s.R_stroke,
			strokeWidth: ms_s.R_strokeWidth,
			lineCap: ms_s.R_cap,
			points: [0,0,0,ms_c.slider_height]
		});

		//Highlight
/*		marker_slider.on("mouseover", function(){
			//MouseStyle.changeToGrab();
			rangeline.setStroke('blue');
			haplo_layer.draw();
		});*/

		//Highlight
		marker_slider.on("mouseout", function(){
			MouseStyle.restoreCursor();
			rangeline.setStroke('red');
			haplo_layer.draw();
		});

		rangeline.on("mouseover", MouseStyle.changeToGrab);


		// Update all input positions
		rangeline.on('mousedown mouseout', function (e){
			MouseStyle.changeToMove();
			MarkerSlider._rangeline_pos = this.getAbsolutePosition();
			MarkerSlider._last_input1_posy = MarkerSlider._sl_input1.getAbsolutePosition().y;
			MarkerSlider._last_input2_posy = MarkerSlider._sl_input2.getAbsolutePosition().y;

			SliderHandler.updateSlide();
		});

		// Sliding Window
		MarkerSlider._slwin_group = new Kinetic.Group({
			draggable:true,
			dragBoundFunc: SliderHandler.sliderDragFunc
		});

		MarkerSlider._slwin_group.on('dragmove', function(){
			MouseStyle.changeToMove();
			if (HAP_DRAW_LIM < HAP_MIN_DRAW){
				SliderHandler.updateHaploPositions();
			}
		});
		
		MarkerSlider._slwin_group.on('mousedown', function(){
			MouseStyle.changeToGrab();
			function mouseUpFunc(){
				MouseStyle.restoreCursor();
				SliderHandler.updateHaploPositions();
				document.removeEventListener("mouseup", arguments.callee, false)
				//console.log("ASA")
			}
			document.addEventListener("mouseup", mouseUpFunc, false);
		});

		var	slwin_lin = new Kinetic.Line({
				x:0, y:0,
				stroke: ms_s.I_stroke,
				strokeWidth: ms_s.I_strokeWidth,
				points:[0,0,0,ms_c.slider_height]
			}),

			slwin_tex = new Kinetic.Text({
				x: ms_s.bevel + ms_c.slideinp_w/2,
				y: ms_c.slider_height/2,
				text: "win",
				fontFamily: ms_s.I_fontFamily,
				fontSize: ms_s.I_fontSize,
				fill: ms_s.I_fontColor
			});

		MarkerSlider._slwin_group.add( slwin_lin );
		MarkerSlider._slwin_group.add( slwin_tex );

		// Easy accessors
		MarkerSlider._slwin_group.line = slwin_lin;
		MarkerSlider._slwin_group.message = slwin_tex;

		MarkerSlider._slwin_group.message.on("mouseover", MouseStyle.changeToMove);

		//Inputs
		MarkerSlider._sl_input1 = MarkerSlider.__makeInputSlider(true),
		MarkerSlider._sl_input2 = MarkerSlider.__makeInputSlider(false);
		MarkerSlider._sl_input2.setY(ms_c.slider_height);

		MarkerSlider._rangeline_pos = {x: xer, y:yer};
		MarkerSlider._last_input1_posy = yer;
		MarkerSlider._last_input2_posy = yer + ms_c.slider_height;

		marker_slider.add( rangeline   );
		marker_slider.add( MarkerSlider._sl_input1   );
		marker_slider.add( MarkerSlider._sl_input2   );
		marker_slider.add( MarkerSlider._slwin_group );

		marker_slider.rangeline = rangeline;

		return marker_slider;
	}
}