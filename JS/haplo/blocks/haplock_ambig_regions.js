
var pointer_array;

var search = function lookahead(group, index, stretcham){

	var next_colors = pointer_array[index],
		found_color = false;

	for (var c=0; c < next_colors; c++)
	{
		if (group === next_colors[c]){
			found_color = true;
			break;
		}
	}

	if (found_color)
		lookahead(group, index +1, stretcham+1)
	else

		if (stretcham >= MIN_HAP_STRETCH){
			return current + lookahead(

		}



		return stretcham;
}
