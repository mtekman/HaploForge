//General storage, global scope
var family_map = {},            // fam_id ---> pedigree map --> person
    marker_array = [];          // array index  --> rs_id

// Draw globals
var nodeSize = 10;
var horiz_space = 50,
    vert_space = 50,
	max_fam_width = 200; //px

var default_stroke_color = 'blue',
    default_font = "bold 10px Courier";

var grid_rezY = nodeSize*6,
	grid_rezX = nodeSize*2;



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
