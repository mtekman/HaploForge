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

					var fid = person1.family;

					person1	= family_map[fid][person1.id];
					person2	= family_map[fid][person2.id];


					var moth = (person1.gender===2)?person1:person2,
						fath = (person1.gender===1)?person1:person2;

					moth.mates.push(fath);
					fath.mates.push(moth);

					//TEST
								

					populateGrids_and_UniqueObjs( {nodes:personDraw.used_ids });
					
					// Need to manually insert the line
					var u_matesline = UUID('m', fath.id, moth.id);

					var line_pos = relationshipDraw._tmpLine.getAbsolutePosition(),
						group_pos = familyDraw.active_fam_group.getAbsolutePosition(),
						new_line = relationshipDraw._tmpLine.clone();

					familyDraw.active_fam_group.add(new_line)

					new_line.setX(line_pos.x - group_pos.x);
					new_line.setY(line_pos.y - group_pos.y);

					addFamMap.incrementEdges(
						u_matesline, fath.id, moth.id, 0,
						unique_graph_objs[fid].edges,
						new_line
					)
					new_line.setZIndex(1);


					//reset
					relationshipDraw.endLineDraw();
					main_layer.draw();

					new_line.setX(0);
					new_line.setY(0);			
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