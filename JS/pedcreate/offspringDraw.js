
class OffspringDraw extends LineDrawOps {

	constructor(familyID){

		super(familyID);

		if (OffspringDraw.numMateLines(familyID) < 1){
			console.log("No matelines detected");
			this.init = null;
		}
		else {

			this._RLineMethod = changeRLine

			this._endPoint = {x:-1,y:-1};

			this.matelineNodeID = null;
			this.childNodeID = null;

//			this._onendlinedraw = function ( matelineID ){
//				this.matelineNodeID = matelineID;
//				console.log("stored mateline_ID", this.matelineNodeID)
//			};


			// First click, and nodes encapsulate second click
			//
			this._oncirclemousedown = function(circle, circlegroup){
				this.childNodeID = circle.id;
				console.log("childNodeID", this.childNodeID)
				circlegroup.destroy(); // For offspring, hide circles as soon as one is picked as a start point

				var _this = this;

				var familyID = _this._family;

				var fam_group = unique_graph_objs[familyID].group,
					edge_map  = unique_graph_objs[familyID].edges,
					node_map  = unique_graph_objs[familyID].nodes;

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
							var center = node.getPosition();
							context.beginPath();
							context.arc(0, 0, 40, 0, 2 * Math.PI, true);
							context.closePath();
							context.fillStrokeShape(node);
						});

						node.matelineID = key;

						// Lock offspring line to node if nearby
						node.on("mouseover", function(){
							_this.lockToNode(node);
						});

						// Mouse up -- it's been selected
						node.on("mouseup", function(){
							_this.lockToNode(node);

							_this.matelineNodeID = node.matelineID;
							console.log("stored mateline_ID", _this.matelineNodeID);

							_this.insertLineIntoMap();

							nodeGroup.destroy();
							delete unique_graph_objs[familyID].edges[this.matelineID].sib_anchor

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
				_this._layer.add(nodeGroup);
				_this._layer.draw();
				//main_layer.draw();
			}
		}
	}


	insertLineIntoMap(){

		var u_childline = UUID('c', this.matelineNodeID, this.childNodeID);

		var father_mother_ids = this.matelineNodeID.split(':')[1].split('-'),
			father = family_map[this._family][Number(father_mother_ids[0])],
			mother = family_map[this._family][Number(father_mother_ids[1])],
			child = family_map[this._family][this.childNodeID];

		father.children.push(child); 
		mother.children.push(child);

		child.mother = mother;
		child.father = father;

		//addFamMap.addTrioEdges(mother, father, child);

		var new_line = this._tmpLine.clone();

		unique_graph_objs[this._family].group.add(new_line);

		addFamMap.incrementEdges(
			u_childline, this.matelineNodeID, child.id, 2,
			unique_graph_objs[this._family].edges,
			new_line
		);

		new_line.setZIndex(1);
		redrawNodes(father.id, this._family, true);
		main_layer.draw();
	}


	lockToNode(node) {
		if (this._tmpLine !== null)
		{
			this._endPoint = node.getPosition();
			this.updateLine();
			this._layer.draw();
		}
	}


	static numMateLines(famID){
		return Object.keys(unique_graph_objs[famID].edges).filter(v => v[0] === 'm').length;
	}
};