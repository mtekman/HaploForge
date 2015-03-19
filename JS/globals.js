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

var HAP_DRAW_LIM = 100, // No more than 30 haplotypes on screen
	HAP_MIN_DRAW = 50,  // Minimum before haplos aare updated on drag.
	HAP_VERT_SPA = 10;

var haplomode_panel_xoffs = 100,
	haplomode_marker_buffer = (function(){ var te=5,tx=""; while(te --> 0) tx +=" ";})(),
	haplomode_ht_spacing = (function(){ var te=2,tx=""; while(te --> 0) tx +=" ";})(),

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



// Graph obj globals
var generation_grid_ids = {}, //fam_id --> [generation array]
	unique_graph_objs = {}; // fam_id --> Holds node and edge data, including pointers to graphics



// Button
var butt_w = 50,
	butt_h = 20;

// Haplo
var min_haplo_x = horiz_space,
	max_haplo_x = horiz_space + 30;

// Marker Slider
var slideinp_w = 20,
	slideinp_h = 5,
	slider_height = innerHeight * 0.5,
	I_slider_extension = 15,
	I_slider_offset = (slideinp_w/3);


var slider_style = {
	R_stroke:'red',
	R_strokeWidth: 5,
	R_cap:'round',
	I_stroke:'black',
	I_strokeWidth:2,
	I_fontFamily: 'Arial',
	I_fontSize: 10,
	I_fontColor: 'black'};



var SEXLINKED = false;
