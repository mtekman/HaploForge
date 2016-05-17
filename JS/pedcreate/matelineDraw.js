var matelineDraw = {

	_layer: null, /* Layer */
	_tmpRect: null, /* Rectangle for mousemove */
	_tmpLine: null,
	_circleDetected: false, /*Mutex for beginLineDraw and mouseover Circle*/
	_startPoint: {x:-1,y:-1},
		
	startNodeID: null,
	endNodeID: null,

	_delHitRect: function(){
		this._layer.destroy();
	},

	_addHitRect: function()
	{		
		this._layer = (new Kinetic.Layer({
			width: stage.getWidth(),
			height:stage.getHeight(),
			x:0, y:0
		}));

		this._tmpRect = (new Kinetic.Rect({
			width: stage.getWidth(),
			height:stage.getHeight(),
			x:0, y:0,
		}))

		stage.add( this._layer );
		this._layer.add(this._tmpRect);

		for (var perc_id in personDraw.used_ids)
		{
			var personIn = personDraw.used_ids[perc_id]

			if (personIn.family !== familyDraw.active_fam_group.id){
				continue;
			}

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
				
				if (matelineDraw._startPoint.x === -1){
					matelineDraw.changeToArrowCursor();
				}
				else { //Start point set
					matelineDraw._circleDetected = true;

					changeRLineHoriz(
						matelineDraw._tmpLine,
						matelineDraw._startPoint,
						this.getAbsolutePosition()
					);

					matelineDraw._layer.draw();
				}
			});

			circle.on("mouseout", function(){
				if (matelineDraw._startPoint.x === -1){
					matelineDraw.restoreCursor();
				}
				else{
					matelineDraw._circleDetected = false;
				}
			});


			circle.on("mousedown", function(event)
			{
				if (matelineDraw._startPoint.x === -1){
					var cX = this.getX(),
						cY = this.getY();

					matelineDraw._startPoint = {x:cX, y:cY};
					matelineDraw.startNodeID = this.id

					matelineDraw.beginLineDraw();
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

					var person1 = personDraw.used_ids[Number(matelineDraw.startNodeID)],
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

					if (person1.gender === person2.gender){
						var type = {0: 'unknowns',
									1: 'males, not yet applicable',
									2: 'females, not yet applicable'};

						utility.notify("Error:", "Cannot join two " + type[person1.gender]);
						return;
					}


					var moth = (person1.gender===2)?person1:person2,
						fath = (person1.gender===1)?person1:person2;

					moth.mates.push(fath);
					fath.mates.push(moth);

					// Need to manually insert the line
					var u_matesline = UUID('m', fath.id, moth.id);

					var line_pos = matelineDraw._tmpLine.getAbsolutePosition(),
						group_pos = familyDraw.active_fam_group.getAbsolutePosition(),
						new_line = matelineDraw._tmpLine.clone();

					familyDraw.active_fam_group.add(new_line);

					new_line.setX(line_pos.x - group_pos.x);
					new_line.setY(line_pos.y - group_pos.y);

					addFamMap.incrementEdges(
						u_matesline, fath.id, moth.id, 0,
						unique_graph_objs[fid].edges,
						new_line
					)
					new_line.setZIndex(1);

					//reset
					matelineDraw.endLineDraw();
					main_layer.draw();

					//new_line.setX(0);
					//new_line.setY(0);			
				}

			});
			this._layer.add(circle);
		}
		this._layer.draw();
	},

	endLineDraw:function(){
		this._delHitRect();	
		
		if (this._tmpLine!==null){
			this._tmpLine.destroy();
		}
		
		this.restoreCursor();

		//reset
		this._startPoint = {x:-1,y:-1};
	},

	beginLineDraw: function(){

		this._tmpLine = new Kinetic.Line({
			stroke: 'black',
			strokeWidth: 2,
		});

		this._layer.add(this._tmpLine);
	
		this._tmpRect.on("mousemove", function(event)
		{
			if(matelineDraw._circleDetected === false){

				var mouseX = Math.floor(event.evt.clientX/grid_rezX)*grid_rezX,
					mouseY = Math.floor(event.evt.clientY/grid_rezY)*grid_rezY;

				changeRLineHoriz(
					matelineDraw._tmpLine,
					matelineDraw._startPoint,
					{x:mouseX,y:mouseY}
				);
	
				matelineDraw._layer.draw();
			}
		});

		this._tmpRect.on("mouseup", function(event){

//			if (matelineDraw._startPoint.x !== -1 
//				&& !(matelineDraw._circleDetected)){

				// Usually means it didn't find a circle to end it
				matelineDraw.endLineDraw();
//			}
		})

	},

	changeToArrowCursor: function(){
		document.body.style.cursor = "url('assets/Precision.cur'),auto";
	},

	restoreCursor: function(){
		document.body.style.cursor = "";
	},

	init: function()
	{

		if (this._tmpLine !== null){
			this.endLineDraw();
		}

		this._addHitRect();
	}
}