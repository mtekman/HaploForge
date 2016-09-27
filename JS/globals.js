

var PED = {
	MALE : 1,
	FEMALE : 2,
	UNAFFECTED : 1,
	AFFECTED : 2,
	UNKNOWN : 0,
}





// Draw globals
var nodeSize = 10;
var horiz_space = 60,
    vert_space = 50;

var default_stroke_color = 'blue',
    default_font = "bold 10px Courier";

var grid_rezY = nodeSize*6,
	grid_rezX = nodeSize*2;

var max_fam_width = 160

var HAP_DRAW_LIM = 30, // No more than 30 haplotypes on screen
	HAP_MIN_DRAW = 70,  // Minimum before haplos are updated on drag.
	HAP_VERT_SPA = 10,
	updateHaploScrollHeight = function(new_lim = null)
	{
		HAP_DRAW_LIM = new_lim || HAP_DRAW_LIM;

		HaploBlock.end_index = HaploBlock.sta_index + HAP_DRAW_LIM;
	
		HaploWindow._bottom.rect.setHeight(
			(HAP_DRAW_LIM+3) * HAP_VERT_SPA 
		);

		HaploBlock.redrawHaplos();
		SliderHandler.updateInputsByIndex();
		SliderHandler.updateSlide();

	},
	numVisibleHaplos = function(){
		return Math.floor(((window.innerHeight - 4) / HAP_VERT_SPA) - 15);
	}



var col_affs = [
    'grey',        // 0 - Unknown
    'white',       // 1 - Unaffected
    'red'];        // 2 - Affected





function intersectArrays(a,b){
	var ai=0, bi=0;
	var result = new Array();

	while( ai < a.length && bi < b.length )
	{
		if      (a[ai].id < b[bi].id ){ ai++; }
		else if (a[ai].id > b[bi].id ){ bi++; }
		else /* they're equal */
		{
			result.push(a[ai]);
			ai++;
			bi++;
		}
	}
	return result;
}




function exportToTab(text)
{
	function makeTextFile(tex, textFile = null)
	{
		var data = new Blob([tex],{type:'text/plain'});

		if (textFile !== null){
			window.URL.revokeObjectURL(textFile);
		}

		textFile = window.URL.createObjectURL(data);
		return textFile;
	}
	window.open(makeTextFile(text));
}



function assert(bool, message){                     //General error handling
    if (!bool) throw new Error(message);
}

// for some reason keys wont sort numerically for negative keys
function sortedKeys(mapper){
	return Object.keys(mapper).sort(function (a,b){ return a - b});
}

function map2orderedArray(mapper){
	var keys = sortedKeys(mapper);

	var ordered_array = [];

	for (var k = 0; k < keys.length; k++){
		var obj = mapper[keys[k]];
		
		ordered_array.push(obj);
	}

	return ordered_array;
}

function isEmpty(map){
	return Object.getOwnPropertyNames(map).length === 0;
}

// Button
var butt_w = 90,
	butt_h = 20;

// Haplo
var min_haplo_x = horiz_space,
	max_haplo_x = horiz_space + 30;




var in2Space = function(integ){
	var tx="";
	while (integ --> 0){tx += " "};
	return tx;
}

// units are em except when px is used
var haploblock_settings = {
	space_pixels: 6,    // 1em for monospace 10
	marker_offset: 1,
	ht_offset: 7,
	ht_2_ht: 1
};
//Do not edit this!
var haploblock_buffers = {
	marker_offset : in2Space(haploblock_settings.marker_offset),
	ht_offset : in2Space(haploblock_settings.ht_offset),
	ht_2_ht : in2Space(haploblock_settings.ht_2_ht)
};


var haploblock_spacers = {
	marker_offset_px: ((MarkerData.maxlen_marker+1)*haploblock_settings.space_pixels)+1,
	person_offset_px: 10 * haploblock_settings.space_pixels,
	block_width_px: HAP_VERT_SPA*1.2,
	block_offset_px: (HAP_VERT_SPA*1.2) +2
};

