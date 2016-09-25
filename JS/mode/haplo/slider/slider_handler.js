

var SliderHandler = {

	i_slider_top_y:0,
	i_slider_length:0,

	// -- Drag specific -- //
	inputDragFunc( abspos){

		var perc, rsindex;

		if (this.isTop){
			var atstart = false;

			if (abspos.y >= MarkerSlider._last_input2_posy)
				abspos.y = MarkerSlider._last_input2_posy;
			if (abspos.y <= MarkerSlider._rangeline_pos.y)
			{
				abspos.y = MarkerSlider._rangeline_pos.y + 1;
				atstart = true;
			}
			MarkerSlider._last_input1_posy = abspos.y;

			perc =  (abspos.y - MarkerSlider._rangeline_pos.y) / MarkerSlider._config.slider_height;

			MarkerSlider._last_input1_ind = rsindex = (atstart?0:Math.floor(perc * MarkerData.rs_array.length));
		}
		else {
			var atend = false;

			if (abspos.y <= MarkerSlider._last_input1_posy)
				abspos.y = MarkerSlider._last_input1_posy;
	 		if (abspos.y > MarkerSlider._rangeline_pos.y + MarkerSlider._config.slider_height){
				abspos.y = MarkerSlider._rangeline_pos.y + MarkerSlider._config.slider_height;
				atend = true;
			}
			MarkerSlider._last_input2_posy = abspos.y;

			perc =  (abspos.y - MarkerSlider._rangeline_pos.y) / MarkerSlider._config.slider_height;

			MarkerSlider._last_input2_ind = rsindex = (atend?MarkerData.rs_array.length-1:Math.floor(perc * MarkerData.rs_array.length));
		}
		this.message.setText(MarkerData.rs_array[rsindex]);

		SliderHandler.updateSlide();

		return {x: this.getAbsolutePosition().x, y: abspos.y};
	},

	sliderDragFunc( p ){
		// p.y is the top I bar

		// Get top and bottom I's;
		var top_I = p.y - MarkerSlider._rangeline_pos.y,
			bot_I = top_I + SliderHandler.i_slider_length;

	  	if (top_I < 0){
	  		top_I = 0;
			bot_I = top_I + SliderHandler.i_slider_length;
		}
	  	else if (bot_I >= MarkerSlider._config.slider_height){
			bot_I = MarkerSlider._config.slider_height;
			top_I = bot_I - SliderHandler.i_slider_length;
		}

	 	SliderHandler.updateInputsByPos(top_I, bot_I);

		return {
			x: this.getAbsolutePosition().x,
			y: top_I + MarkerSlider._rangeline_pos.y
		};
	},


	// --- Non-drag specific, but called by Drag Events
	updateSlide()
	{
		if (MarkerSlider._rangeline_pos === null){
			return -1;
		}

		var offs = MarkerSlider._config.I_slider_offset;

		SliderHandler.i_slider_top_y = MarkerSlider._last_input1_posy - MarkerSlider._rangeline_pos.y;
		SliderHandler.i_slider_length= MarkerSlider._last_input2_posy - MarkerSlider._last_input1_posy;

		var top_slider = [-offs, 0 ],
			bot_slider = [-offs, SliderHandler.i_slider_length];

		MarkerSlider._slwin_group.setY(SliderHandler.i_slider_top_y);

		MarkerSlider._slwin_group.line.setPoints([
			-MarkerSlider._style.bevel+ top_slider[0] + offs*2, top_slider[1] + MarkerSlider._style.bevel,
			top_slider[0], top_slider[1] + MarkerSlider._style.bevel,
			bot_slider[0], bot_slider[1] + MarkerSlider._style.bevel,
			-MarkerSlider._style.bevel + bot_slider[0] + offs*2, bot_slider[1] + MarkerSlider._style.bevel
		]);

		MarkerSlider._slwin_group.message.setText( MarkerSlider._last_input2_ind - MarkerSlider._last_input1_ind );
		MarkerSlider._slwin_group.message.setY( (SliderHandler.i_slider_length/2) - HAP_VERT_SPA/2 );
	},

	updateInputsByPos(top,bot)
	{
		MarkerSlider._sl_input1.setY(top);
	 	MarkerSlider._sl_input2.setY(bot);

	 	MarkerSlider._last_input1_ind = (top===0)?0:Math.floor(top * MarkerData.rs_array.length/ MarkerSlider._config.slider_height),
		MarkerSlider._last_input2_ind = (bot===MarkerSlider._config.slider_height)?MarkerData.rs_array.length-1:Math.floor(bot * MarkerData.rs_array.length/ MarkerSlider._config.slider_height);

		MarkerSlider._sl_input1.message.setText( MarkerData.rs_array[MarkerSlider._last_input1_ind] );
		MarkerSlider._sl_input2.message.setText( MarkerData.rs_array[MarkerSlider._last_input2_ind] );

		MarkerSlider._last_input1_posy = top + MarkerSlider._rangeline_pos.y;
		MarkerSlider._last_input2_posy = bot + MarkerSlider._rangeline_pos.y;
	},


	updateInputsByIndex(ind1, ind2)
	{
		ind1 = ind1 || HaploBlock.sta_index;
		ind2 = ind2 || HaploBlock.end_index;

		if (ind2 >= MarkerData.rs_array.length){
			ind2 = MarkerData.rs_array.length -1
			ind1 = ind2 - HAP_DRAW_LIM;
		}
		else if (ind1 < 0){
			ind1 = 0
			ind2 = HAP_DRAW_LIM;
		}


		MarkerSlider._last_input1_ind = ind1;
		MarkerSlider._last_input2_ind = ind2;

		var top = (MarkerSlider._last_input1_ind / MarkerData.rs_array.length) * MarkerSlider._config.slider_height,
			bot = (MarkerSlider._last_input2_ind / MarkerData.rs_array.length) * MarkerSlider._config.slider_height;

		if (MarkerSlider._sl_input1 !== null){
			MarkerSlider._sl_input1.setY(top);
			MarkerSlider._sl_input2.setY(bot);

			MarkerSlider._sl_input1.message.setText( MarkerData.rs_array[MarkerSlider._last_input1_ind] );
			MarkerSlider._sl_input2.message.setText( MarkerData.rs_array[MarkerSlider._last_input2_ind] );

			MarkerSlider._last_input1_posy = top + MarkerSlider._rangeline_pos.y;
			MarkerSlider._last_input2_posy = bot + MarkerSlider._rangeline_pos.y;
		}
	},

	// ---- Called by mouseup events
	updateHaploPositions(resizecanvastoo){

		HaploBlock.sta_index = MarkerSlider._last_input1_ind;
		HaploBlock.end_index = MarkerSlider._last_input2_ind;
		HAP_DRAW_LIM = HaploBlock.end_index - HaploBlock.sta_index;

		HaploWindow._bottom
			.rect
			.setHeight( (HAP_DRAW_LIM+3) * HAP_VERT_SPA);

		HaploBlock.redrawHaplos(resizecanvastoo);
	}
}