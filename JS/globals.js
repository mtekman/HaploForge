//General storage, global scope
var family_map = {},            // fam_id ---> pedigree map --> person
	marker_map = {},          	// rs_id --> array index
	marker_array = [];


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
	HAP_MIN_DRAW = 50,  // Minimum before haplos aare updated on drag.
	HAP_VERT_SPA = 10;


var haplomode_panel_xoffs = 100;

var use_right_angles = true,
	use_grid = true;


var col_affs = [
    'grey',        // 0 - Unknown
    'white',       // 1 - Unaffected
    'red'];        // 2 - Affected



function toInt(arg){                                // For some reason parseInt wont work properly
    return parseInt(arg);                           // as a lambda function arg.... wtf?
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


// Graph obj globals
var generation_grid_ids = {}, //fam_id --> [generation array]
	unique_graph_objs = {}; // fam_id --> Holds node and edge data, including pointers to graphics

var maxlen_marker = 0; // set by filehandler, read by addHaploBlocks


// Button
var butt_w = 90,
	butt_h = 20;

// Haplo
var min_haplo_x = horiz_space,
	max_haplo_x = horiz_space + 30;

// Marker Slider
var slideinp_w = 20,
	slideinp_h = 20,
	slider_height = innerHeight * 0.75,
	I_slider_extension = 35,
	I_slider_offset = (slideinp_w/3);


var slider_style = {
	R_stroke:'red',
	R_strokeWidth: 5,
	R_cap:'round',
	I_stroke:'white',
	I_strokeWidth:2,
	I_fontFamily: "monospace",
	I_fontSize: 10,
	I_fontColor: 'red',
	S_fontColor: 'white',
	bevel: 10};


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
	marker_offset_px: ((maxlen_marker+11)*haploblock_settings.space_pixels)+1,
	person_offset_px: 10 * haploblock_settings.space_pixels,
	block_width_px: HAP_VERT_SPA*1.2,
	block_offset_px: (HAP_VERT_SPA*1.2) +2
};


var SEXLINKED = false,
	DOMINANT = true;

var MALE = 1,
	FEMALE = 2,
	UNAFFECTED = 1,
	AFFECTED = 2;
