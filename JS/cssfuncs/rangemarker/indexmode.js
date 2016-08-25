var index_submit = document.getElementById('index_submit'),
	index_min = document.getElementById('marker_list_min'),
	index_max = document.getElementById('marker_list_max'),
	index_min_input = document.getElementById('marker_min'),
	index_max_input = document.getElementById('marker_max');


index_min_input.onchange = updateMaxIndexDataList;
index_submit.onclick = submitIndexRange;

//One off
function populateIndexDataList()
{
	var inner_options = "";
	
	for (var m=0; m < marker_array.length; m++){
		inner_options += '<option value="' + marker_array[m] + '" />';
	}

	index_min.innerHTML = inner_options;
}

// Repeated
function updateMaxIndexDataList()
{
	var min_index = marker_array.indexOf( index_min_input.value );

	var inner_options = "";

	for (var m=min_index; m < marker_array.length; m++){
		inner_options += '<option value="' + marker_array[m] + '" />';
	}
	index_max.innerHTML = inner_options;
}



function showIndexCSS(){
	document.getElementById('index_class').style.display = "block"
}

function hideIndexCSS(){
	document.getElementById('index_class').style.display = "none"
}

function submitIndexRange(){
	var min_range_value = index_min_input.value,
		max_range_value = index_max_input.value;

	var min_range = marker_array.indexOf( min_range_value ),
		max_range = marker_array.indexOf( max_range_value );

	if ((min_range === -1) || (max_range === -1) ){
		console.log("invalid range");
		return 0;
	}


	if (min_range > max_range){
		console.log("min must be greater than max");
		return 0;
	}

	console.log(min_range,max_range);

	sta_index = min_range;
	end_index = max_range;

	redrawHaplos(true);

	hideIndexCSS();

}