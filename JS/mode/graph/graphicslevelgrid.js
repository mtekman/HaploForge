/* Family map must be populated and connected before a level map can ge generated */

/** A level grid is made to facilitate determining which generations individuals belong to
    This class hooks into Level Grid */

var GraphicsLevelGrid = {

	graphics_map : null,

	_unique_nodes_fam: null,
	_unique_edges_fam: null,

	init: function(fid, graphicsMap = null)
	{
		GraphicsLevelGrid.graphics_map = null;

		if (graphicsMap !== null){
			GraphicsLevelGrid.graphics_map = graphicsMap;
		}

		GraphicsLevelGrid._populate(fid);

		return GraphicsLevelGrid.graphics_map;
	},


	_populate(fid){

		GraphicsLevelGrid._unique_edges_fam = {};
		GraphicsLevelGrid._unique_nodes_fam = {
			0 : {
				graphics: null
			}
		};
	
		/* LevelGrid generates a level map whilst using
		   graphic callbacks */
		var level_grid = GlobalLevelGrid.populate(fid, 
			function cb1(perc){
				// Populates this._unique_nodes_fam
				GraphicsLevelGrid.insertNode(perc.id);
			},
		
			function cb2(perc){
				if (perc.mother != 0 && perc.father != 0){
					// Populates this._unique_edges_fam
					GraphicsLevelGrid.addTrioEdges(perc.mother, perc.father, perc);
				}
			}
		);

		GlobalLevelGrid.insertGrid(fid, level_grid);

		var uniq_map = {
			nodes: GraphicsLevelGrid._unique_nodes_fam,
			edges: GraphicsLevelGrid._unique_edges_fam
		};

		GraphicsLevelGrid.graphics_map = uniq_map;
	},


	addTrioEdges(moth, fath, child){
		//= Assume all indivs are != 0
		var u_matesline = edgeAccessor.matelineID(fath.id, moth.id),
			u_childline = edgeAccessor.childlineID(u_matesline, child.id);

		//= Edges
		GraphicsLevelGrid.insertEdges(u_matesline, fath.id, moth.id, 0);
		GraphicsLevelGrid.insertEdges(u_childline, u_matesline, child.id, 2);

		//= Nodes
		GraphicsLevelGrid.insertNode(moth.id);
		GraphicsLevelGrid.insertNode(fath.id);
		GraphicsLevelGrid.insertNode(child.id); //Already in
	},


	insertNode(id){
		if (!(id in GraphicsLevelGrid._unique_nodes_fam))
		{
			var graphicsObj = null;
			
			// If node already has graphics, reinsert it into new map
			if (GraphicsLevelGrid.graphics_map !== null ){
				graphicsObj = GraphicsLevelGrid.graphics_map.nodes[id];
			}

			GraphicsLevelGrid._unique_nodes_fam[id] = {
				graphics:graphicsObj,		// if being read from pedfile, set later by placePerp
			 };
		}
		else{
			// Id exists, but perhaps not graphics? reinsert into new map
			if (GraphicsLevelGrid.graphics_map !== null ){

				var graphicsObj = GraphicsLevelGrid.graphics_map.nodes[id];
				GraphicsLevelGrid._unique_nodes_fam[id].graphics = graphicsObj;
			}
		}
	},

	insertEdges(id, start_join, end_join, typer,
		mapper = GraphicsLevelGrid._unique_edges_fam,
		graphicsObj = null)
	{
		if (!(id in mapper))
		{
			mapper[id] = {
				graphics:graphicsObj,			//set later by placePerp
				type:typer,
				start_join_id: start_join,      //Note: IDs, not positions
				end_join_id: end_join,
				double_line: false 				// Consangineous
			}
		}
	}
}
