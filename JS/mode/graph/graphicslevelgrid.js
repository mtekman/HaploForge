/* Family map must be populated and connected before a level map can ge generated */

/** A level grid is made to facilitate determining which generations individuals belong to
    This class hooks into Level Grid */

class GraphicsLevelGrid {


	constructor(fid, graphicsMap = null){
		this.graphics_map = graphicsMap;	
		this._populate(fid);
	}

	getMap(){
		return this.graphics_map;
	}


	_populate(fid){

		/* Not vars because addTrio uses them */
		this._unique_edges_fam = {};
		this._unique_nodes_fam = {
			0 : {
				graphics: null
			}
		};
	
		/* LevelGrid generates a level map whilst using
		   graphic callbacks */
		var that = this;

		var level_grid = GlobalLevelGrid.__populate(fid, 
			function cb1(perc){
				// Populates this._unique_nodes_fam
				that.insertNode(perc.id);
			},
		
			function cb2(perc){
				if (perc.mother != 0 && perc.father != 0){
					// Populates this._unique_edges_fam
					that.addTrioEdges(perc.mother, perc.father, perc);
				}
			}
		);

//		console.log(fid, level_grid);

		GlobalLevelGrid.insertGrid(fid, level_grid);

		var uniq_map = {
			nodes: this._unique_nodes_fam,
			edges: this._unique_edges_fam
		};

		this.graphics_map = uniq_map;
	}


	addTrioEdges(moth, fath, child){
		//= Assume all indivs are != 0
		var u_matesline = edgeAccessor.matelineID(fath.id, moth.id),
			u_childline = edgeAccessor.childlineID(u_matesline, child.id);

		//= Edges
		this.insertEdges(u_matesline, fath.id, moth.id, 0);
		this.insertEdges(u_childline, u_matesline, child.id, 2);

		//= Nodes
		this.insertNode(moth.id);
		this.insertNode(fath.id);
		this.insertNode(child.id); //Already in
	}


	insertNode(id){
		if (!(id in this._unique_nodes_fam))
		{
			var graphicsObj = null;
			
			// If node already has graphics, reinsert it into new map
			if (this.graphics_map !== null ){
				graphicsObj = this.graphics_map.nodes[id];
			}

			this._unique_nodes_fam[id] = {
				graphics:graphicsObj,		// if being read from pedfile, set later by placePerp
			 };
		}
		else{
			// Id exists, but perhaps not graphics? reinsert into new map
			if (this.graphics_map !== null ){

				var graphicsObj = this.graphics_map.nodes[id];
				this._unique_nodes_fam[id].graphics = graphicsObj;
			}
		}
	}

	insertEdges(id, start_join, end_join, type, 
		consang = false,
		mapper = this._unique_edges_fam,
		graphicsObj = null){

		if (!(id in mapper))
		{
			mapper[id] = {
				graphics:graphicsObj,			//set later by placePerp
				type:type,
				start_join_id: start_join,      //Note: IDs, not positions
				end_join_id: end_join,
				consangineous: consang 				// Consangineous
			}
		}
	}
}
