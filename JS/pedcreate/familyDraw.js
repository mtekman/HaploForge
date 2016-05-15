var familyDraw = {

	active_fam_group : null,
	family_map : {},

	selectFam: function(fid){
		// Deselect previous group
		if (this.active_fam_group !== null){
			this.active_fam_group.fam_title_text.setFontStyle("normal");
		}

		// Select new group
		var fam = this.family_map[fid]
		fam.fam_title_text.setFontStyle("bold");
		main_layer.draw();

		// Make new group active
		this.active_fam_group = fam;
	},

	addFam: function(fam_id = null, position = null){	

		if (fam_id === null){
			fam_id = utility.prompt("Family ID?");
		}

		if (fam_id in this.family_map){
			utility.message("Family ID",fam_id,"already in use");
			return;
		}

		var fam = addFamily( fam_id, 50, 50 );
		this.family_map[fam.id] = fam;

		fam.on( "click dragstart" , function(){
			familyDraw.selectFam(fam.id);
		});

		fam.fam_title_text.setFontStyle("bold");
		this.active_fam_group = fam;


		if (position !== null){
			fam.setX(position.x);
			fam.setY(position.y);
		}

		
		main_layer.draw()
	},	
}
