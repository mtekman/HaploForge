
class offspringDraw extends LineDrawOps {

	constructor(familyID){

		super(familyID);
		
		if (offspringDraw.numMateLines(familyID) > 0){

			this._endPoint = {x:-1,y:-1};

			this._matelineNodeID = null;
			this.childNodeID = null;

			this._onendlinedraw = function ( matelineID ){
				offspringDraw.matelineNodeID = matelineID;
				console.log("stored mateline_ID")
			};

			this._oncirclemousedown = function(circle){
				this.childNodeID = circle.id;			
			};

			this._onaddhit = function(){
				var _this = this;

				var familyID = _this._family;

				var fam_group = unique_graph_objs[familyID].group,
					edge_map  = unique_graph_objs[familyID].edges;


				for (var key in edge_map){
					if (key[0]==='m')
					{
						console.log(key);
						var mateline_graphics = edge_map[key].graphics;

						// Sib_Anchor node is TEMPORARY. It is deleted upon ~offspringDraw()
						var node = addCircle("white", nodeSize/2);

						node.matelineID = key;

						// Lock offspring line to node if nearby
						node.on("mouseover", function(){
							if (_this._tmpLine !== null)
							{
								_this._endPoint = this.getPosition();
							}
						});

						// Mouse up -- it's been selected
						node.on("mouseup", function(){
							if (_this._tmpLine !== null)
							{
								_this._endPoint = this.getPosition();
								_this.endLineDraw( this.matelineID );
							}
						});

						mateline_graphics.sib_anchor = node;
						
						fam_group.add( mateline_graphics.sib_anchor );

						changeRLineHoriz(mateline_graphics)
					}
				}
				main_layer.draw()
			}
		}
	}


	static numMateLines(famID){
		return Object.keys(unique_graph_objs[famID].edges).filter(v => v[0] === 'm').length;
	}
};