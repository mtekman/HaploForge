//General storage, global scope
var family_map = {},            // fam_id ---> pedigree map --> person
    marker_array = [];          // array index  --> rs_id


// Canvas globals
var cnv = document.getElementById("canvy");
cnv.width = window.innerWidth;
cnv.height= window.innerHeight;

var ctx = cnv.getContext("2d");


// Draw globals
var nodeSize = 10;
var horiz_space = 50,
    vert_space = 50;

ctx.strokeStyle = 'blue';
ctx.font = "bold 10px Courier";

var col_affs = [
    'grey',        // 0 - Unknown
    'white',       // 1 - Unaffected
    'red'];        // 2 - Affected



