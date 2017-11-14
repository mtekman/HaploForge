import { MarkerData } from '/JS/filehandler/markerdata.js';

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

var HAP_DRAW_LIM = 30; // No more than 30 haplotypes on screen
var	HAP_MIN_DRAW = 100;  // Minimum before haplos are updated on drag.
var HAP_VERT_SPA = 10;  // <-- DO NOT MODIFY


var col_affs = [
    'grey',        // 0 - Unknown
    'white',       // 1 - Unaffected
    'red'];        // 2 - Affected

export function error(message) {
	utility.notify("Error", message, 5);
	throw new Error(message)
}

export function exportToTab(text)
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

// Padding for fixed width output
String.prototype.paddingLeft = function (paddingValue) {
   return String(paddingValue + this).slice(-paddingValue.length);
};

String.prototype.center = function(padding){
	var pN = padding.length,
		tN = this.length;

	if (pN < tN){
		console.log(this,padding.length);
		throw Error("Text to small to fit in padding");
	}

	var todist = pN - tN,
		rightN = Math.floor(todist / 2),
		leftN  = todist - rightN;

	return String(padding.slice(0,leftN) + this + padding.slice(-rightN));
}


export function randomIndex(len){
	return Math.floor(Math.random() * len);
}

export function map2orderedArray(mapper){
	// Sorted keys
	var keys = Object.keys(mapper).sort(function (a,b){ return a - b});

	var ordered_array = [];

	for (var k = 0; k < keys.length; k++){
		var obj = mapper[keys[k]];

		ordered_array.push(obj);
	}

	return ordered_array;
}

export function isEmpty(map){
	return Object.getOwnPropertyNames(map).length === 0;
}


var in2Space = function(integ){
	var tx="";
	while (integ --> 0){tx += " "};
	return tx;
}

// units are em except when px is used
export var haploblock_settings = {
	space_pixels: 6,    // 1em for monospace 10
	marker_offset: 1,
	ht_offset: 7,
	ht_2_ht: 1,
	font_family: "Roboto Mono"
};
//Do not edit this!
export var haploblock_buffers = {
	marker_offset : in2Space(haploblock_settings.marker_offset),
	ht_offset : in2Space(haploblock_settings.ht_offset),
	ht_2_ht : in2Space(haploblock_settings.ht_2_ht)
};


export var haploblock_spacers = {
	marker_offset_px: ((MarkerData.maxlen_marker+1)*haploblock_settings.space_pixels)+1,
	person_offset_px: 10 * haploblock_settings.space_pixels,
	block_width_px: HAP_VERT_SPA*1.2,
	block_offset_px: (HAP_VERT_SPA*1.2) +2
};
