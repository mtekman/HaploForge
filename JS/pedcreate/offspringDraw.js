

/*
var offspringDraw = {

	// "Inherited"
	_layer: lineDrawOps._layer,
	_tmpRect: lineDrawOps._tmpRect,
	_tmpLine : lineDrawOps._tmpLine,
	_startPoint : lineDrawOps._startPoint,
	_delHitRect: lineDrawOps._delHitRect,
	_addHitRect: lineDrawOps._addHitRect,

	beginLineDraw: lineDrawOps.beginLineDraw,
	init: lineDrawOps.init,

	_endPoint : {x:-1,y:-1},
	
	matelineNodeID: null,
	childNodeID: null,


	endLineDraw: function( matelineID ){
		lineDrawOps.endLineDraw(function(){
			offspringDraw.matelineNodeID = matelineID;
			console.log("stored mateline_ID")
		});
	},
		
	drawNodes: function(familyID){

		var fam_group = unique_graph_objs[familyID].group,
			edge_map  = unique_graph_objs[familyID].edges;

		var _this = this;

		for (var key in edge_map){
			if (key[0]==='m'){
				var mateline_graphics = edge_map[key].graphics;

				// Sib_Anchor node is TEMPORARY. It is deleted upon ~offspringDraw()
				var node = addCircle("white", nodeSize/2);

				node.matelineID = key;

				// Lock offspring line to node if nearby
				node.on("mouseover", function(){
					if (lineDrawOps._tmpLine !== null)
					{
						_this._endPoint = this.getPosition();
					}
				});

				// Mouse up -- it's been selected
				node.on("mouseup", function(){
					if (lineDrawOps._tmpLine !== null)
					{
						_this._endPoint = this.getPosition();
						_this.endLineDraw( this.matelineID );
					}
				});

				mateline_graphics.sib_anchor = node;
				
				fam_group.add( mateline_graphics.sib_anchor );
			}
		}
	}
};*/