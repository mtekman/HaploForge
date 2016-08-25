var uniqueGraphOps = {

	_map : {}, // fam_id --> Holds node and edge data, including pointers to graphics
	haplo_scroll : null,
	haplo_area : null,

	clear: function(){
		uniqueGraphOps._map = {};
	},

	foreachfam: function(callback){
		for (var fam in uniqueGraphOps._map){
			callback(fam);
		}
	},

	foreachnode: function(callback, fam_id = null){
		if (fam_id === null){

			for (var fam in uniqueGraphOps._map){
				for (var node in uniqueGraphOps.getFam(fam).nodes){
					callback(node, fam);
				}
			}
		} else {
			for (var node in uniqueGraphOps.getFam(fam_id).nodes){
				callback(node);
			}
		}
	},

	insertFam: function(family_id, fam_group){

		if (!(family_id in uniqueGraphOps._map))
		{
			uniqueGraphOps._map[family_id] = {
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
		if (family_id in uniqueGraphOps._map){
			delete uniqueGraphOps._map[family_id];
			return 0;
		}
		return -1;
	},

	getFam: function(family_id){
		if (family_id in uniqueGraphOps._map){
			return uniqueGraphOps._map[family_id];
		}
		return -1;
	},

	famExists: function(family_id){
		return (family_id in uniqueGraphOps._map);
	},

	insertNode: function(id, family_id, graphics)
	{
		this.insertFam(family_id);

		if (!(id in uniqueGraphOps._map[family_id].nodes)){
			uniqueGraphOps._map[family_id].nodes[id] = {graphics:graphics};
			console.log("UGO: created new node", id, "in", family_id);
			return 0;
		}
		return -1;
	},

	deleteNode: function(id, family_id)
	{
		if (family_id in uniqueGraphOps._map){
			if (id in uniqueGraphOps._map[family_id].nodes){
				delete uniqueGraphOps._map[family_id].nodes[id];
				return 0;
			}
		}
		return -1;
	},

	getNode: function(id, family_id){
		if (family_id in uniqueGraphOps._map){
			if (id in uniqueGraphOps._map[family_id].nodes){
				return uniqueGraphOps._map[family_id].nodes[id];
			}
		}
		return -1;
	},


	insertEdge: function(id, family_id, graphics)
	{
		insertFam(family_id);

		if (!(id in uniqueGraphOps._map[family_id].edges)){
			uniqueGraphOps._map[family_id].edges[id] = {graphics:graphics};
			console.log("UGO: created new edge", id, "in", family_id);
			return 0;
		}
		return -1;
	},

	deleteEdge: function(id, family_id)
	{
		if (family_id in uniqueGraphOps._map){
			if (id in uniqueGraphOps._map[family_id].edges){
				delete uniqueGraphOps._map[family_id].edges[id];
				return 0;
			}
		}
		return -1;
	},

	getEdge: function(id, family_id)
	{
		if (family_id in uniqueGraphOps._map){
			if (id in uniqueGraphOps._map[family_id].edges){
				return uniqueGraphOps._map[family_id].edges[id];
			}
		}
		return -1;
	}
}