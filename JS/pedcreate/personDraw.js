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

		return new Person(id_count, 0, 0);
	},


	changeNodeProps: function(node)
	{
		var oldX = node.getX(),
			oldY = node.getY(),
			oldID= node.id,
			oldFam = node.family;

		
		var new_person = new Person(11, 2, 2);

		if (new_person.id in this.used_ids){
			utility.message("Id already in use");
			new_person.id = 15;
		}
		
		node.destroy();

		// Update ids list
		delete this.used_ids[oldID]

		//Update family map
		familyMapOps.remove(oldID, oldFam);
		familyMapOps.insert(new_person, oldFam);

		//Update graphics
		uniqueGraphOps.deleteNode(oldID, oldFam);
		uniqueGraphOps.insertNode(new_person, oldFam, perc);

		var new_node = this.addNode(new_person, {x:oldX, y:oldY});
		main_layer.draw();
	},

	showNodeMenu: function(node){
		/*TODO*/
		// For now, just change props
		this.changeNodeProps(node);
	},

	addNode: function(person = null, position= null){

		if (familyDraw.active_fam_group === null){
			familyDraw.addFam();
		}

		var fam_group = familyDraw.active_fam_group;
		uniqueGraphOps.insertFam(fam_group.id, fam_group);

		if (person === null ){ 
			person = this.makeTempPerson();
		}

		var perc = addPerson( person, fam_group,  
				grid_rezX ,
				50 // + Math.random()*grid_rezY*2
		);

		perc.family = fam_group.id;


		perc.on("click", function(){
			familyDraw.selectFam(this.family);
		})


		perc.on("dblclick", function(){
			personDraw.showNodeMenu(perc);
		})

		// Add to used IDs
		this.used_ids[person.id] = perc;



		//family map stores the person data
		// used_ids stores the graphics
		familyMapOps.insert(person, perc.family);
		uniqueGraphOps.insertNode(person.id, perc.family, perc);

		if (position !== null){
			perc.setX(position.x);
			perc.setY(position.y);
		}

		main_layer.draw();
		return perc;
	}
}