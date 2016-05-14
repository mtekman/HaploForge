

function initiatePedigreeDraw(){

	document.getElementById("buttons").style.display = 'none'
	finishDraw(); // Initialize stage
}



var relationshipDraw = {

	_hitRect: null, /* Layer */
	_tmpRect: null, /* Rectangle for mousemove */
	_tmpLine: null,
	_circleDetected: false, /*Mutex for beginLineDraw and mouseover Circle*/
	_startPoint: {x:-1,y:-1},

	_delHitRect: function(){
		this._hitRect.destroy();
	},

	_addHitRect: function()
	{		
		this._hitRect = (new Kinetic.Layer({
			width: stage.getWidth(),
			height:stage.getHeight(),
			x:0, y:0
		}));

		this._tmpRect = (new Kinetic.Rect({
			width: stage.getWidth(),
			height:stage.getHeight(),
			x:0, y:0,
		}))

		stage.add( this._hitRect );
		this._hitRect.add(this._tmpRect);

		for (var perc_id in personDraw.used_ids)
		{
			var gfx = personDraw.used_ids[perc_id].gfx;

			var apos = gfx.getAbsolutePosition(),
				rad = 15 ;

			var circle = new Kinetic.Circle({
				x: apos.x, 
				y: apos.y,
				radius: rad*2,
				stroke:"red",
				strokeWidth:2.5
			});


			circle.on("mouseover", function(event){
				
				if (relationshipDraw._startPoint.x === -1){
					relationshipDraw.changeToArrowCursor();
				}
				else { //Start point set
					relationshipDraw._circleDetected = true;

					changeRLine(
						relationshipDraw._tmpLine,
						relationshipDraw._startPoint,
						this.getAbsolutePosition()
					);

					relationshipDraw._hitRect.draw();
				}
			});

			circle.on("mouseout", function(){
				if (relationshipDraw._startPoint.x === -1){
					relationshipDraw.restoreCursor();
				}
				else{
					relationshipDraw._circleDetected = false;
				}
			});


			circle.on("mousedown click", function(event)
			{
				if (relationshipDraw._startPoint.x === -1){
					var cX = this.getX(),
						cY = this.getY();

					relationshipDraw._startPoint = {x:cX, y:cY};
					relationshipDraw.beginLineDraw();
				}
				else { //Set end point
					
					//Add line to unique_graph_obs so that dragevents would update it
					//But ONLY after the relationship has been set


					//reset
					relationshipDraw.endLineDraw();
				}

			});
			this._hitRect.add(circle);
		}
		this._hitRect.draw();
	},

	endLineDraw:function(){
		this._delHitRect();	
		this._tmpLine.destroy();
		this.restoreCursor();

		//reset
		this._startPoint = {x:-1,y:-1};
	},

	beginLineDraw: function(){
	
		this._tmpLine = new Kinetic.Line({
			stroke: 'black',
			strokeWidth: 2,
		});

		this._hitRect.add(this._tmpLine);
	
		this._tmpRect.on("mousemove", function(event)
		{
			if(relationshipDraw._circleDetected === false){

				var mouseX = Math.floor(event.evt.clientX/grid_rezX)*grid_rezX,
					mouseY = Math.floor(event.evt.clientY/grid_rezY)*grid_rezY;

				changeRLine(
					relationshipDraw._tmpLine,
					relationshipDraw._startPoint,
					{x:mouseX,y:mouseY}
				);
	
				relationshipDraw._hitRect.draw();
			}
		});
	},

	changeToArrowCursor: function(){
		document.body.style.cursor = "url('assets/Precision.cur'),auto";
	},

	restoreCursor: function(){
		document.body.style.cursor = "";
	},

	firstPoint: function()
	{
		this._addHitRect();
	}
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

		main_layer.draw();
		return perc;
	}
}

initiatePedigreeDraw();
familyDraw.addFam(1001)
personDraw.addNode();
personDraw.addNode({id:90,gender:1,affected:1});

familyDraw.addFam(1002, {x:500, y:100});
personDraw.addNode({id:18,gender:2,affected:2});

relationshipDraw.firstPoint();