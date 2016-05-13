

function initiatePedigreeDraw(){

	document.getElementById("buttons").style.display = 'none'
	finishDraw(); // Initialize stage
}


var utility = {

	prompt: function(query){
		// Own method drop in?
		return prompt(query);
	},



	message: function(){
		/* Change to a notification system for users*/
		console.log(arguments)
	},

	getMouseXY: function(){
		return stage.getPointerPosition();
	},


}


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

	addFam: function(fam_id = null){	

		if (fam_id === null){
			fam_id = utility.prompt("Family ID?");
		}

		if (fam_id in this.family_map){
			utility.message("Family ID",fam_id,"already in use");
			return;
		}

		var fam = addFamily( fam_id, 50, 50 );

		this.family_map[fam.id] = fam;

		fam.on( "click" , function(){
			familyDraw.selectFam(fam.id);
		});

		fam.fam_title_text.setFontStyle("bold");
		this.active_fam_group = fam;
		
		main_layer.draw()
	},	
}


var personDraw = {


	//Ids MUST be unique, even if user doesn't have a specific ID in mind
	// -- Required for makeTempPerson() to have unique hooks in family and graph data
	// -- The user can then change it later
	used_ids : {},

	makeTempPerson: function()
	{
		//Get smallest unused id
		var id_counter = 0;
		while (++id_counter in this.used_ids){}

		return {gender:0, affected:0, id:id_counter};
	},


	changeNodeProps: function(node)
	{
		var oldX = node.getX(),
			oldY = node.getY(),
			oldID= node.id;

		
		var new_person = {gender:2, affected:2, id: 11};

		if (new_person.id in this.used_ids){
			utility.message("Id already in use");
			new_person.id = 15;
		}
		
		node.destroy();

		// Update ids list
		delete this.used_ids[oldID]

		var new_node = this.addNode(new_person);
		
		new_node.setX(oldX);
		new_node.setY(oldY);

		main_layer.draw();
	},

	showNodeMenu: function(node){
		/*TODO*/
		// For now, just change props
		this.changeNodeProps(node);
	},

	addNode: function(person = null){

		if (familyDraw.active_fam_group === null){
			familyDraw.addFam();
		}

		var fam_group = familyDraw.active_fam_group;

		if (person === null ){ 
			person = this.makeTempPerson();
		}

		// Add to used IDs
		this.used_ids[person.id] = true;

		var perc = addPerson( person, fam_group,  
				grid_rezX ,
				10 + Math.random()*grid_rezY*2
		);

		perc.family = fam_group.id;


		perc.on("click", function(){
			familyDraw.selectFam(this.family);
		})


		perc.on("dblclick", function(){
			personDraw.showNodeMenu(perc);
		})

		main_layer.draw();
		return perc;
	}
}
/*
initiatePedigreeDraw();
familyDraw.addFam(1001)
personDraw.addNode();
personDraw.addNode();

familyDraw.addFam(1002);
personDraw.addNode();
personDraw.addNode();
*/