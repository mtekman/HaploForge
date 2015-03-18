var i_slider_top_y=0,
	i_slider_length = 0;


function inputDragFunc( abspos){

	var perc = (abspos.y - rangeline_pos.y) / slider_height,
		rsindex;


	if (this.isTop){
		var atstart = false;

		if (abspos.y >= last_input2_posy)
			abspos.y = last_input2_posy - 8;
		if (abspos.y <= rangeline_pos.y)
		{
			abspos.y = rangeline_pos.y + 1;
			atstart = true;
		}

		last_input1_posy = abspos.y;
		last_input1_ind = rsindex = (atstart?0:Math.floor(perc * marker_array.length));
	}
	else {
		var atend = false;
		if (abspos.y <= last_input1_posy)
			abspos.y = last_input1_posy + 8;
 		if (abspos.y > rangeline_pos.y + slider_height){
			abspos.y = rangeline_pos.y + slider_height;
			atend = true;
		}

		last_input2_posy = abspos.y;
		last_input2_ind = rsindex = (atend?marker_array.length-1:Math.floor(perc * marker_array.length));
	}

	this.message.setText(marker_array[rsindex]);

	updateSlide();

	return {x: this.getAbsolutePosition().x, y: abspos.y};
}


function updateSlide()
{
	var offs = slideinp_w/2;

	i_slider_top_y = last_input1_posy - rangeline_pos.y;
	i_slider_length= (last_input2_posy - last_input1_posy);

	var top_slider = [-offs, 0 ],
		bot_slider = [-offs, i_slider_length];

	slwin_group.setY(i_slider_top_y);

	slwin_group.line.setPoints([
		top_slider[0] - offs, top_slider[1],
		top_slider[0] + offs, top_slider[1],
		top_slider[0], top_slider[1],
		bot_slider[0], bot_slider[1],
		bot_slider[0] - offs, bot_slider[1],
		bot_slider[0] + offs, bot_slider[1]
	]);

	slwin_group.message.setText( last_input2_ind - last_input1_ind );
	slwin_group.message.setY( i_slider_length/2 );
}

/// ---------------------

function sliderDragFunc( p )
{
	// p.y is the top I bar

	// Get top and bottom I's;
	var top_I = p.y - rangeline_pos.y,
		bot_I = top_I + i_slider_length;

  	if (top_I < 0){
  		top_I = 0;
		bot_I = top_I + i_slider_length;
	}
  	else if (bot_I >= slider_height){
		bot_I = slider_height;
		top_I = bot_I - i_slider_length;
	}

 	updateInputs(top_I, bot_I);

	return {x: this.getAbsolutePosition().x, y: top_I + rangeline_pos.y};
}


function updateInputs(top,bot)
{
	sl_input1.setY(top);
 	sl_input2.setY(bot);

// 	console.log(top, bot);

 	var index1 = (top===0)?0:Math.floor(top * marker_array.length/ slider_height),
 		index2 = (bot===slider_height)?marker_array.length-1:Math.floor(bot * marker_array.length/ slider_height);


	sl_input1.message.setText( marker_array[index1] );
	sl_input2.message.setText( marker_array[index2] );

	last_input1_posy = top + rangeline_pos.y;
	last_input2_posy = bot + rangeline_pos.y;

}
