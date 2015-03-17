var top_slider= [0,0],
	bot_slider= [0,0];


function inputDragFunc( abspos){

	var perc = (abspos.y - rangeline_pos.y) / slider_height,
		rsindex;


	if (this.isTop){
		if (abspos.y >= last_input2_posy)
			abspos.y = last_input2_posy - 8;
		if (abspos.y < rangeline_pos.y)
			abspos.y = rangeline_pos.y

		last_input1_posy = abspos.y;
		last_input1_ind = rsindex = Math.floor(perc * marker_array.length);
	}
	else {
		if (abspos.y <= last_input1_posy)
			abspos.y = last_input1_posy + 8;
 		if (abspos.y > rangeline_pos.y + slider_height)
			abspos.y = rangeline_pos.y + height;

		last_input2_posy = abspos.y;
		last_input2_ind = rsindex = Math.floor(perc * marker_array.length);
	}

	this.message.setText(marker_array[rsindex]);

	updateSlide();

	return {x: this.getAbsolutePosition().x, y: abspos.y};
}


function updateSlide()
{
	var offs = slideinp_w/2;

	top_slider = [-offs, (last_input1_posy - rangeline_pos.y) ];
	bot_slider = [-offs, (last_input2_posy - rangeline_pos.y) ];

	slwin_group.setY(0);

	slwin_group.line.setPoints([
		top_slider[0] - offs, top_slider[1],
		top_slider[0] + offs, top_slider[1],
		top_slider[0], top_slider[1],
		bot_slider[0], bot_slider[1],
		bot_slider[0] - offs, bot_slider[1],
		bot_slider[0] + offs, bot_slider[1]
	]);
	slwin_group.message.setText( last_input2_ind - last_input1_ind );
	slwin_group.message.setY(   (bot_slider[1] + top_slider[1])/2 );
}

/// ---------------------


function sliderDragFunc( p )
{
	var top_I = p.y - rangeline_pos.y, //get diff
		bot_I = top_I + (top_slider[1] - bot_slider[1]);

	console.log( p.y, rangeline_pos.y, top_I);


	top_slider[1] = top_I;
	bot_slider[1] = bot_I;


	if (top_slider[1] < rangeline_pos.y)
		top_slider[1] = rangeline_pos.y

	else if (bot_slider[1] > rangeline_pos.y + slider_height)
		bot_slider[1] = rangeline_pos.y + slider_height;

	updateInputs(top_I, bot_I);

	return {x: this.getAbsolutePosition().x, y: p.y};
}


function updateInputs(topy,boty)
{
	sl_input1.move({x:0, y:topy});
// 	sl_input2.setY(boty);
}
