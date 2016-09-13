var uniqueGraphOps = {

	_map : {}, // fam_id --> Holds node and edge data, including pointers to graphics
	haplo_scroll : null,
	haplo_area : null,

	clear: function(){
		uniqueGraphOps._map = {};
	},

	foreachfam: function(callback){
		for (var fam in uniqueGraphOps._map){
			callback(fam, uniqueGraphOps.getFam(fam));
		}
	},

	foreachnode: function(callback, fam_id = null){
		if (fam_id === null){

			for (var fam in uniqueGraphOps._map){
				for (var node in uniqueGraphOps.getFam(fam).nodes){
					if (node === "0"){
						continue;
					}
					callback(node, fam, uniqueGraphOps.getNode(node, fam));
				}
			}
		} else {
			for (var node in uniqueGraphOps.getFam(fam_id).nodes){
				if (node === "0"){
					continue;
				}
				callback(node, uniqueGraphOps.getNode(node, fam_id));
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
		throw new Error("No such family "+family_id);
	},

	getFam: function(family_id){
		if (family_id in uniqueGraphOps._map){
			return uniqueGraphOps._map[family_id];
		}
		throw new Error("No such family "+family_id);
	},

	famExists: function(family_id){
		return (family_id in uniqueGraphOps._map);
	},

	edgeExists: function(key, family_id){
		if (family_id in uniqueGraphOps._map){
			return (key in uniqueGraphOps._map[family_id].edges)		
		}
		throw new Error("No such family "+family_id);
	},


	nodeExists: function(key, family_id){
		if (family_id in uniqueGraphOps._map){
			return (key in uniqueGraphOps._map[family_id].nodes)
		}
		throw new Error("No such family "+family_id);
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
			if (id in uniqueGraphOps._map[family_id].nodes)
			{
				uniqueGraphOps._map[family_id].nodes[id].graphics.destroy();
				delete uniqueGraphOps._map[family_id].nodes[id];
				return 0;
			}
		}
		throw new Error("No such node "+id);
	},

	getNode: function(id, family_id){
		if (family_id in uniqueGraphOps._map){
			if (id in uniqueGraphOps._map[family_id].nodes){
				return uniqueGraphOps._map[family_id].nodes[id];
			}
		}
		throw new Error("No such node "+id);
	},


	insertEdge: function(id, family_id, graphics,
		start_join_id = null,
		end_join_id = null,
		type = null,
		consangineous = null)
	{
		if (!(id in uniqueGraphOps._map[family_id].edges)){
			uniqueGraphOps._map[family_id].edges[id] = {
				graphics:graphics,
				start_join_id : start_join_id,
				end_join_id : end_join_id,
				consangineous: consangineous,
				type: type,
			};
			console.log("UGO: created new edge", id, "in", family_id);
			return 0;
		}
		return -1;
	},

	deleteEdge: function(id, family_id)
	{
		if (family_id in uniqueGraphOps._map){
			if (id in uniqueGraphOps._map[family_id].edges){
				uniqueGraphOps._map[family_id].edges[id].graphics.destroy();
				delete uniqueGraphOps._map[family_id].edges[id];
				return 0;
			}
		}
		return -1;
	},

	transferEdge: function(family_id, oldid, newid){
		console.log("transferring", oldid, newid);

		var old_edge = uniqueGraphOps.getEdge(oldid, family_id);
		delete uniqueGraphOps._map[family_id].edges[oldid];
		uniqueGraphOps.insertEdge(newid, family_id, old_edge.graphics,
			old_edge.start_join_id,
			old_edge.end_join_id,
			old_edge.type,
			old_edge.consangineous);
	},

	getEdge: function(id, family_id)
	{
		if (family_id in uniqueGraphOps._map){
			if (id in uniqueGraphOps._map[family_id].edges){
				return uniqueGraphOps._map[family_id].edges[id];
			}
		}
		throw new Error("No such edge "+id);
	},

	getChildEdge: function(family_id, father_id, mother_id, child_id)
	{
		if (family_id in uniqueGraphOps._map)
		{
			var mate_key = edgeAccessor.matelineID(father_id, mother_id)
			if (uniqueGraphOps.edgeExists(mate_key, family_id))
			{
				var child_key = edgeAccessor.childlineID(mate_key, child_id)
				if (uniqueGraphOps.edgeExists(child_key, family_id)){
					return child_key;
				}
				throw new Error("No such child edge "+child_key);
			}
			throw new Error("No such mate edge "+mate_key);
		}
		throw new Error("No such family "+family_id);
	},

	makeChildEdge: function(family_id, father_id, mother_id, child_id)
	{
		if (family_id in uniqueGraphOps._map)
		{
			var mate_key = edgeAccessor.matelineID(father_id, mother_id)
			var child_key = edgeAccessor.childlineID(mate_key, child_id)
			return child_key;
		}
		throw new Error("No such family "+family_id);
	},

	getMateEdge: function(family_id, father_id, mother_id)
	{
		if (family_id in uniqueGraphOps._map)
		{
			var mate_key = edgeAccessor.matelineID(father_id, mother_id)
			if (uniqueGraphOps.edgeExists(mate_key, family_id))
			{
				return mate_key;
			}
		}
		throw new Error("No such family "+family_id);
	}
}