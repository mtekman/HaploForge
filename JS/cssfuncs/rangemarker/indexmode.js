import Resize from '/JS/window/resizing.js'
import HaploBlock from '/JS/mode/haplo/blocks/haploblock_frontend.js';

var CSSMarkerRange = {

	_submit : document.getElementById('index_submit'),
	_min : document.getElementById('marker_list_min'),
	_max : document.getElementById('marker_list_max'),
	_min_input : document.getElementById('marker_min'),
	_max_input : document.getElementById('marker_max'),

	_initialised: false,
	_visible: false,

	init(){
		CSSMarkerRange._visible?CSSMarkerRange.__hideIndexCSS():CSSMarkerRange.__showIndexCSS();

		if (CSSMarkerRange._initialised){
			return 0;
		}

		CSSMarkerRange._min_input.onchange = CSSMarkerRange.updateMaxIndexDataList;
		CSSMarkerRange._submit.onclick = CSSMarkerRange.submitIndexRange;
		CSSMarkerRange.__populateIndexDataList();
	},

	//One off
	__populateIndexDataList(){
		var inner_options = "";

		for (var m=0; m < MarkerData.rs_array.length; m++){
			inner_options += '<option value="' + MarkerData.rs_array[m] + '" />';
		}

		CSSMarkerRange._min.innerHTML = inner_options;
	},

	// Repeated
	updateMaxIndexDataList()
	{
		var min_index = MarkerData.rs_array.indexOf( CSSMarkerRange._min_input.value );

		var inner_options = "";

		for (var m=min_index; m < MarkerData.rs_array.length; m++){
			inner_options += '<option value="' + MarkerData.rs_array[m] + '" />';
		}
		CSSMarkerRange._max.innerHTML = inner_options;
	},

	__showIndexCSS(){
		Keyboard.layerOn("indexCSS");

		Keyboard.addKeyPressTask("Enter", function(){
			if (CSSMarkerRange._max_input.value.length < 4){
				CSSMarkerRange._max_input.focus();
			}
			else {
				CSSMarkerRange.submitIndexRange();
			}
		});


		CSSMarkerRange._visible = true;
		document.getElementById('index_class').style.display = "block"
		CSSMarkerRange._min_input.focus()
	},

	__hideIndexCSS(){
		Keyboard.layerOff();

		CSSMarkerRange._visible = false;
		document.getElementById('index_class').style.display = "none"
	},


	submitIndexRange(){
		var min_range_value = CSSMarkerRange._min_input.value,
			max_range_value = CSSMarkerRange._max_input.value;

		var min_range = MarkerData.rs_array.indexOf( min_range_value ),
			max_range = MarkerData.rs_array.indexOf( max_range_value );

		if ((min_range === -1) || (max_range === -1) ){
			console.log("invalid range");
			return 0;
		}


		if (min_range > max_range){
			console.log("min must be greater than max");
			return 0;
		}

		HaploBlock.sta_index = min_range;
		HaploBlock.end_index = max_range;

		Resize.updateHaploScrollHeight( max_range - min_range );

		HaploBlock.redrawHaplos(true);

		CSSMarkerRange.__hideIndexCSS();
	}
}
