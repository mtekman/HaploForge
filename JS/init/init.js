import familyMapOps from '/JS/pedigree/familymapops.js';
import uniqueGraphOps from '/JS/pedigree/uniquegraphops.js';
import FounderColor from '/JS/mode/haplo/blocks/colors.js';
import familyDraw from '/JS/mode/pedcreate/familyDraw.js';
import MainPageHandler from '/JS/cssfuncs/mainpage/mainpagehandler.js';
import Allegro from '/JS/filehandler/formats/allegro.js';
import Genehunter from '/JS/filehandler/formats/genehunter.js';
import Merlin from '/JS/filehandler/formats/merlin.js';
import Simwalk from '/JS/filehandler/formats/simwalk.js';
import { MarkerData } from '/JS/filehandler/markerdata.js';

var init = {

	clearMaps: function(){
		familyDraw.active_fam_group = null;

		FounderColor.clear();
		GlobalLevelGrid.clear();
		MarkerData.clear();
		familyMapOps.clear();
		uniqueGraphOps.clear();
	},

	haploview : {

		allegro : function(){
			(new Allegro());
		},

		genehunter: function(){
			(new Genehunter()); // yeah "new" is required...
								// gc does its job
								// intergrate the latests changes
		},

		simwalk: function(){
			(new Simwalk());
		},

		merlin: function(){
			(new Merlin());
		}
	},

	pedcreate : function(){
		HaploPedProps.init();
		graphInitPos(nodeSize + 10, grid_rezY, true);
	}
}


MainPageHandler.defaultload();
