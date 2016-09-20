"use strict";

/** Local storage keys

Two types of saves: pedigree and haplotype (regardless of format)

Pedigree is a LINKAGE format with graphics meta appended at the end
Haplotype is a compressed JSON with haplo + map data (if map given);

**/
var localStor = {
	ped_save : 'ped_data',
	ped_type : 'ped_type',
	hap_save : 'hap_data',  // Own data format
	hap_type : 'hap_type',
	transfer : 'transferFromHaploToPed' // pedigrees in haplo can be modified
}

var FORMAT = {
	PEDFILE : 0,
	ALLEGRO : {
		HAPLO:   1, // ihaplo
		DESCENT: 2, // inher
		MAP  :   3  // map
	},
	SIMWALK : {
		HAPLO:   4, // HEF
		MAP  :   5  // map
	},
	GHM     : {
		HAPLO:   6, // haplo
		MAP  :   7, // map
		PED  :   8  // pedin
	},
	MERLIN  : {
		PED :    9,  // pedin
		HAPLO:   10, // chr
		DESCENT: 11, // flow
		MAP:     12  // map
	},
	UNKNOWN : -1
}
