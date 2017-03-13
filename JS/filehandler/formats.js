"use strict";

var localStor = {
	ped_save : 'ped_data',
	ped_type : 'ped_type',
	hap_save : 'hap_data',  // Own data format
	hap_type : 'hap_type',
	transfer : 'transferFromHaploToPed' // pedigrees in haplo can be modified
}


// Used by settings.js
function clearLocalHaploStorage(){
	console.group("clear local haplo:")
	for (var key in localStor)
	{
		localStorage.removeItem(localStor[key])
		console.log(key)
	}
	console.groupEnd("clear local haplo:")
}