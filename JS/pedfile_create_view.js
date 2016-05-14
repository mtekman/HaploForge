

function initiatePedigreeDraw(){

	document.getElementById("buttons").style.display = 'none'
	finishDraw(); // Initialize stage
}


var familyMapOps = {

	insert: function(person, family_id){
		
		if (!(family_id in family_map)){
			family_map[family_id] = {}
			console.log("adding new family", family_id)
		}

		if (!(person.id in family_map[family_id])){
			family_map[family_id][person.id] = person;
			return 0;
		}
		console.log(person_id,"already in", family_id)
		return -1;
	},

	remove: function(person_id, family_id)
	{
		if (family_id in family_map){
			if (person_id in family_map[family_id]){
				delete family_map[family_id][person_id];
				return 0;
			}
			console.log(person_id,"not in", family_id)
			return -1;
		}
		console.log(family_id, "not in map");
		return -1;
	}
}



var relationshipDraw = {

	_hitRect: null, /* Layer */
	_tmpRect: null, /* Rectangle for mousemove */
	_tmpLine: null,
	_circleDetected: false, /*Mutex for beginLineDraw and mouseover Circle*/
	_startPoint: {x:-1,y:-1},
	_drawModeActive: false,
	
	startNodeID: null,
	endNodeID: null,

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
			var personIn = personDraw.used_ids[perc_id]
			var gfx = personIn.gfx;

			var apos = gfx.getAbsolutePosition(),
				rad = 15 ;

			var circle = new Kinetic.Circle({
				x: apos.x, 
				y: apos.y,
				radius: rad*2,
				stroke:"red",
				strokeWidth:2.5
			});
			circle.id = perc_id;

			circle.on("mouseover", function(event){
				
				if (relationshipDraw._startPoint.x === -1){
					relationshipDraw.changeToArrowCursor();
				}
				else { //Start point set
					relationshipDraw._circleDetected = true;

					changeRLineHoriz(
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


			circle.on("mousedown", function(event)
			{
				if (relationshipDraw._startPoint.x === -1){
					var cX = this.getX(),
						cY = this.getY();

					relationshipDraw._startPoint = {x:cX, y:cY};
					relationshipDraw.startNodeID = this.id

					relationshipDraw.beginLineDraw();
				}
				else { //Set end point
					
					//Add line to unique_graph_obs so that dragevents would update it
					//But ONLY after the relationship has been set

					// Rules:
					//   1. Two types of lines
					//      a. Mateline
					//      b. Parentline
					//   
					//   2. Parentline hangs from center of Mateline
					//      there requires a Mateline to be present before creation
					//
					//   3. There needs to be a temp node hanging in the center of mateline to
					//      join offspring to.

					// Mates aren't connected in family map, only in unique_graph_lines

					var endId = this.id;

					var person1 = personDraw.used_ids[Number(relationshipDraw.startNodeID)],
						person2 = personDraw.used_ids[Number(endId)];

					if (person1.id === 0 || person2.id === 0){
						console.log("Not possible");
						return;
					}

					if (person1.family !== person2.family){
						console.log("Family's do not match");
						return;
					}

					var mother = (person1.gender===2)?person1:person2,
						father = (person1.gender===1)?person1:person2,
						family_id = person1.family;


					// Convert to Person objects (DO EARLIER!)
					var moth = new Person(mother.id, mother.gender, mother.affected, 0, 0);
					console.log(mother, moth);
					var fath = new Person(father.id, father.gender, father.affected, 0, 0);

					moth.mates.push(fath);
					fath.mates.push(moth);

					//Insert into family map
					if (!(family_id in family_map)){
						family_map[family_id] = {}
					}

					if (!(moth.id in family_map[family_id])){
						family_map[family_id][moth.id] = moth;
					}

					if (!(fath.id in family_map[family_id])){
						family_map[family_id][fath.id] = fath;
					}

					var u_matesline = UUID('m', fath.id, moth.id);

					incrementEdges(u_matesline, fath.id, moth.id, 0);
					incrementNodes(moth.id);
					incrementNodes(fath.id);

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
		
		if (this._tmpLine!==null){
			this._tmpLine.destroy();
		}
		
		this.restoreCursor();

		//reset
		this._drawModeActive = false;
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

				changeRLineHoriz(
					relationshipDraw._tmpLine,
					relationshipDraw._startPoint,
					{x:mouseX,y:mouseY}
				);
	
				relationshipDraw._hitRect.draw();
			}
		});

		this._tmpRect.on("mouseup", function(event){

//			if (relationshipDraw._startPoint.x !== -1 
//				&& !(relationshipDraw._circleDetected)){

				// Usually means it didn't find a circle to end it
				relationshipDraw.endLineDraw();
//			}
		})

	},

	changeToArrowCursor: function(){
		document.body.style.cursor = "url('assets/Precision.cur'),auto";
	},

	restoreCursor: function(){
		document.body.style.cursor = "";
	},

	firstPoint: function()
	{

		if (this._drawModeActive){
			this.endLineDraw();
		}

		this._drawModeActive = true;
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

		familyMapOps.insert(person, perc.family);

		if (position !== null){
			perc.setX(position.x);
			perc.setY(position.y);
		}

		main_layer.draw();
		return perc;
	}
}

initiatePedigreeDraw();
//familyDraw.addFam(1001)
//personDraw.addNode();
//personDraw.addNode({id:90,gender:1,affected:1});

familyDraw.addFam(1002, {x:500, y:100});

var newp1 = new Person(12,2,2),
	newp2 = new Person(11,1,1),
	newp3 = new Person(13,1,2);

personDraw.addNode(
	newp1,
	{x:0, y:50}
);

personDraw.addNode(
	newp2,
	{x:180, y:50}
);

personDraw.addNode(
	newp3,
	{x:90, y:200}
);



relationshipDraw.firstPoint();