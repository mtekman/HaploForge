

offspringDraw = {

	/*_startPoint: inherited */
	_endPoint : {x:-1,y:-1},

	matelineNodeID:null,
	childNodeID:null,

	_matchFound: false,

	init: lineDrawOps.init,

	_addHitRect: function(){
		lineDrawOps._addHitRect(function()
		{		
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
					
					if (lineDrawOps._startPoint.x === -1){
						lineDrawOps.changeToArrowCursor();
					}
					else { //Start point set
						offspringDraw._matchFound = true;

						changeRLineHoriz(
							lineDrawOps._tmpLine,
							lineDrawOps._startPoint,
							this.getAbsolutePosition()
						);

						lineDrawOps._layer.draw();
					}
				});

				circle.on("mouseout", function(){
					if (lineDrawOps._startPoint.x === -1){
						lineDrawOps.restoreCursor();
					}
					else{
						offspringDraw._matchFound = false;
					}
				});


				circle.on("mousedown", function(event)
				{
					if (lineDrawOps._startPoint.x === -1){
						var cX = this.getX(),
							cY = this.getY();

						lineDrawOps._startPoint = {x:cX, y:cY};
						offspringDraw.childNodeID = this.id

						offspringDraw.beginLineDraw();
					}
					else { //Set end point
					}
				});
				lineDrawOps._layer.add(circle);
			}
		})
	},


	beginLineDraw: function(){

		lineDrawOps.beginLineDraw(function mousemover(event)
		{
			if (offspringDraw._matchFound === false){

				var mouseX = Math.floor(event.evt.clientX/grid_rezX)*grid_rezX,
					mouseY = Math.floor(event.evt.clientY/grid_rezY)*grid_rezY;

				changeRLineHoriz(
					lineDrawOps._tmpLine,
					lineDrawOps._startPoint,
					{x:mouseX,y:mouseY}
				);
		
				lineDrawOps._layer.draw();
			}
		});
	},

	endLineDraw: function( matelineID ){
		lineDrawOps.endLineDraw(function(){
			offspringDraw.matelineNodeID = matelineID;
			console.log("ASD")
		});
	},
		
	drawNodes: function(familyID){

		var fam_group = unique_graph_objs[familyID].group,
			edge_map  = unique_graph_objs[familyID].edges;

		for (var key in edge_map){
			if (key[0]==='m'){
				var mateline_graphics = edge_map[key].graphics;

				// Sib_Anchor node is TEMPORARY. It is deleted upon ~offspringDraw()
				var node = addCircle("white", nodeSize/2);

				node.matelineID = key;

				// Lock offspring line to node if nearby
				node.on("mouseover", function(){
					if (offspringDraw._tmpLine !== null)
					{
						offspringDraw._endPoint = this.getPosition();
					}
				});

				// Mouse up -- it's been selected
				node.on("mouseup", function(){
					if (offspringDraw._tmpLine !== null)
					{
						offspringDraw._endPoint = this.getPosition();
						offspringDraw.endLineDraw( this.matelineID );
					}
				});

				mateline_graphics.sib_anchor = node;
				
				fam_group.add( mateline_graphics.sib_anchor );
			}
		}
	}
}