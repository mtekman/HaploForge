var familyDraw = {

	active_fam_group : null,

	selectFam: function(fid){
		// Deselect previous group
		if (familyDraw.active_fam_group !== null){
			familyDraw.active_fam_group.fam_title_text.setFontStyle("normal");
		}

		// Select new group
		var fam = uniqueGraphOps.getFam(fid).group
		fam.fam_title_text.setFontStyle("bold");
		main_layer.draw();

		// Make new group active
		familyDraw.active_fam_group = fam;
	},

	addFam: function(fam_id = null, position = null, callback = null){	

		if (fam_id === null){
			utility.inputprompt("Family ID?", function(family){
				fam_id = family; /*messProps._input.value*/
				familyDraw.addFam(fam_id,position,callback);
			});
			return;
		}

		if (uniqueGraphOps.famExists(fam_id)){
			utility.message("Family ID",fam_id,"already in use");
			return;
		}

		var fam = Graphics.Pedigree.addFamily( fam_id, 50, 50 );
		uniqueGraphOps.insertFam(fam.id, fam);

		fam.on( "click dragstart" , function(){
			familyDraw.selectFam(fam.id);
		});

		fam.fam_title_text.setFontStyle("bold");
		familyDraw.active_fam_group = fam;


		if (position !== null){
			fam.setX(position.x);
			fam.setY(position.y);
		}

		if (callback !== null){
			callback();		
		}

		
		main_layer.draw()
	},	
}
