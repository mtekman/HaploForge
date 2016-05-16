var uniqueGraphOps = {

	insertFam: function(family_id, fam_group){

		if (!(family_id in unique_graph_objs))
		{
			unique_graph_objs[family_id] = {
				nodes:{},
				edges:{},
				group: fam_group
			};

			console.log("UGO: created new fam", family_id)
			return 0;
		}
		return -1;
	},

	deleteFam: function(family_id){
		if (family_id in unique_graph_objs){
			delete unique_graph_objs[family_id];
			return 0;
		}
		return -1;
	},

	insertNode: function(id, family_id, graphics)
	{
		this.insertFam(family_id);

		if (!(id in unique_graph_objs[family_id].nodes)){
			unique_graph_objs[family_id].nodes[id] = {graphics:graphics};
			console.log("UGO: created new node", id, "in", family_id);
			return 0;
		}
		return -1;
	},

	deleteNode: function(id, family_id)
	{
		if (family_id in unique_graph_objs){
			if (id in unique_graph_objs[family_id].nodes){
				delete unique_graph_objs[family_id].nodes[id];
				return 0;
			}
		}
		return -1;
	},


	insertEdge: function(id, family_id, graphics)
	{
		insertFam(family_id);

		if (!(id in unique_graph_objs[family_id].edges)){
			unique_graph_objs[family_id].edges[id] = {graphics:graphics};
			console.log("UGO: created new edge", id, "in", family_id);
			return 0;
		}
		return -1;
	},

	deleteEdge: function(id, family_id)
	{
		if (family_id in unique_graph_objs){
			if (id in unique_graph_objs[family_id].edges){
				delete unique_graph_objs[family_id].edges[id];
				return 0;
			}
		}
		return -1;
	}
}