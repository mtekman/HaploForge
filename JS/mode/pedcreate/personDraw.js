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

		return new Person(id_counter, 0, 0,0 ,0);
	},


	changeNodeProps: function(node)
	{
		var oldX = node.getX(),
			oldY = node.getY(),
			oldID= node.id,
			oldFam = node.family;


		var old_person = familyMapOps.getPerc(oldID,oldFam);
		var new_person = null

		persProps.display(old_person, function(newPerc){
			new_person = newPerc;


			if (oldID !== new_person.id){

				if (new_person.id in personDraw.used_ids){
					utility.notify("Error", "Id already in use");
					return -1;
				}
			}
		
			// Update ids list
			delete personDraw.used_ids[oldID]

			//Update family map
			familyMapOps.removePerc(oldID, oldFam);
			familyMapOps.insertPerc(new_person, oldFam);


			//Update graphics
			uniqueGraphOps.deleteNode(oldID, oldFam);
			var new_node = personDraw.addNode(new_person, {x:oldX, y:oldY});
			uniqueGraphOps.insertNode(new_person.id, oldFam, new_node);

			main_layer.draw();
		});
	},

	showNodeMenu: function(node){
		/*TODO*/
		// For now, just change props
		this.changeNodeProps(node);
	},

	addNode: function(person = null, position= null){

		if (familyDraw.active_fam_group === null)
		{
			var num_fams = familyMapOps.numFams();

			if (num_fams !== 0){
				utility.notify("Note","Need to select family first");
			}
			else {
				utility.notify("No family selected", "Creating new family");

				familyDraw.addFam(null, null, 
					function(){
						personDraw._addNodeToActiveFam(person, position)
					}
				);
			}
		} else{
			personDraw._addNodeToActiveFam(person, position);
		}
	},


	_addNodeToActiveFam: function(person = null, position = null){

		var fam_group = familyDraw.active_fam_group;
		uniqueGraphOps.insertFam(fam_group.id, fam_group);

		if (person === null ){ 
			person = this.makeTempPerson();
		}



		var perc = addPerson( person, fam_group,  
				grid_rezX ,
				-nodeSize // + Math.random()*grid_rezY*2
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
		familyMapOps.insertPerc(person, perc.family);
		uniqueGraphOps.insertNode(person.id, perc.family, perc);

		if (position !== null){
			perc.setX(position.x);
			perc.setY(position.y);
		}
		else {
			// Find next free space
			var next_avail_pos = SelectionGraphics.nextEmptySlot(
				familyDraw.active_fam_group.id
			);
			perc.setX(next_avail_pos.x);
			perc.setY(next_avail_pos.y);
		}

		main_layer.draw();
		return perc;
	}
}