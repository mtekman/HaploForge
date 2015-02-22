//General storage, global scope
var family_map = {},            // fam_id ---> pedigree map --> person
    marker_array = [];          // array index  --> rs_id

// Draw globals
var nodeSize = 10;
var horiz_space = 60,
    vert_space = 50;

var default_stroke_color = 'blue',
    default_font = "bold 10px Courier";

var grid_rezY = nodeSize*6,
	grid_rezX = nodeSize*2;

var max_fam_width = 160

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
