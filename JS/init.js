
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
		},

		simwalk: function(){
			(new Simwalk());
		},

		merlin: function(){
			//utility.notify("TODO", "merlin");
			(new Merlin());
		}
	},

	pedcreate : function(){
		HaploPedProps.init();
		graphInitPos(nodeSize + 10, grid_rezY, true);
	}
}


MainPageHandler.defaultload();


new Tutorial("fred","top","Save It Up", "Helper monkey evil sidekick it started with a dude in a purple hat")