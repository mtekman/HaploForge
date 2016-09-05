/* This class also updates the grid for all parent-offspring connections */

class OffspringDraw extends LineDrawOps {

	constructor(familyID, id_mateline = null, id_childnode = null){

		super(familyID);

		if (OffspringDraw.numMateLines(familyID) < 1)
		{
			this.init = null;
			console.log("No matelines detected");
		
		} else {

			this._RLineMethod = changeRLine

			this._endPoint = {x:-1,y:-1};

			this.matelineID = id_mateline;
			this.childNodeID = id_childnode;


			// If ids set by constructor, just perform a join
			if (this.childNodeID !== null)
			{
				this.__joinIDs();		
			
			} else {
				// First click, and nodes encapsulate second click
				//
				this._oncirclemousedown = function(circle, circlegroup)
				{
					this.childNodeID = circle.id;
					console.log("childNodeID", this.childNodeID)

					circlegroup.destroy(); // For offspring, hide circles as soon as one is picked as a start point
					
					this.__drawNodes();
				}
			}

		}
	}



	__drawNodes() {
		var _this = this;

		var familyID = _this._family;

		var fam_gfx   = uniqueGraphOps.getFam(familyID),
			fam_group = fam_gfx.group,
			edge_map  = fam_gfx.edges,
			node_map  = fam_gfx.nodes;

		var nodeGroup = new Kinetic.Group({});

		for (var key in edge_map){
			if (key[0]==='m')
			{
				var ids = key.split(':')[1].split('-');

				if (ids.indexOf(this.childNodeID)!==-1){
					console.log("skipping", key, "because", this.childNodeID, "exists within pair")
					continue;
				}

				var mateline_graphics = edge_map[key].graphics;

				// Sib_Anchor node is TEMPORARY. It is deleted upon ~offspringDraw()
				var node = addCircle("white", nodeSize/2);

				node.hitFunc(function(context){
					var center = this.getPosition();
					context.beginPath();
					context.arc(0, 0, 40, 0, 2 * Math.PI, true);
					context.closePath();
					context.fillStrokeShape(this);
				});

				node.matelineID = key;

				// Lock offspring line to node if nearby
				node.on("mouseover", function(){
					_this.__lockToNode(this);
				});

				// Mouse up -- it's been selected
				node.on("mouseup", function(){
					_this.__lockToNode(this);

					_this.matelineID = this.matelineID;
					console.log("stored mateline_ID", _this.matelineID);

					_this.__joinIDs();

					nodeGroup.destroy();
					delete uniqueGraphOps.getFam(familyID).edges[this.matelineID].sib_anchor

					_this.endLineDraw();


				});
				mateline_graphics.sib_anchor = node; // changeRline can now update
				
				nodeGroup.add( node );

				var startID = edge_map[key].start_join_id,
					endID = edge_map[key].end_join_id;

				var startGraphics = node_map[startID].graphics,
					endGraphics   = node_map[endID].graphics;

				changeRLineHoriz(mateline_graphics,    // NOT this._RLineMethod
					startGraphics.getAbsolutePosition(),
					endGraphics.getAbsolutePosition());
			}
		}
		this._layer.add(nodeGroup);
		this._layer.draw();
		//main_layer.draw();
	}



	__joinIDs(){

		var u_childline = edgeAccessor.childlineID(this.matelineID, this.childNodeID);

		var father_mother_ids = this.matelineID.split(':')[1].split('-'),
			father = familyMapOps.getPerc(Number(father_mother_ids[0]), this._family),
			mother = familyMapOps.getPerc(Number(father_mother_ids[1]), this._family),
			child = familyMapOps.getPerc(this.childNodeID, this._family);

		father.children.push(child); 
		mother.children.push(child);

		child.mother = mother;
		child.father = father;

		var new_line;
		if (this._tmpLine !== null){
			new_line = this._tmpLine.clone();
		}
		else {
			new_line = new Kinetic.Line({
				stroke: 'black',
				strokeWidth: 2,
				points: [0,0,1,1,2,2]
			});
		}

		uniqueGraphOps.getFam(this._family).group.add(new_line);


		GraphicsLevelGrid.insertEdges(
			u_childline, this.matelineID, child.id, 2, false,
			uniqueGraphOps.getFam(this._family).edges,
			new_line
		);
		new_line.setZIndex(1);


		// Regenerate the level grid otherwise drag functions cry
		GlobalLevelGrid.refreshGrid(this._family);

		redrawNodes(father.id, this._family, true);
		main_layer.draw();
	}


	__lockToNode(node) {
		if (this._tmpLine !== null)
		{
			this._endPoint = node.getPosition();
			this.updateLine();
			this._layer.draw();
		}
	}


	static numMateLines(famID){
		return Object.keys(uniqueGraphOps.getFam(famID).edges).filter(v => v[0] === 'm').length;
	}
};