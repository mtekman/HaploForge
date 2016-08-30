var familyMapOps = {

	_map : {}, // fam_id ---> pedigree map --> person

	_insertionLog : {}, // famid+pedid : counter of how many times attempted insertion
						// should not exceed 2 (per allele line from pedfile)

	clear: function(){
		familyMapOps._map = {}; // reset
	},

	foreachfam: function( callback ){
		for (var fam in familyMapOps._map){
			callback(fam);
		}
	},

	/* If fam_id given, it just iterates over people in the specified famid */
	foreachperc: function( callback, fam_id = null ){
		if (fam_id === null){
			for (var fam in familyMapOps._map){
				for (var perc in familyMapOps.getFam(fam)){
					callback(perc, fam);
				}
			}
		}
		else{
			for (var perc in familyMapOps.getFam(fam_id)){
				callback(perc);
			}
		}
	},

	numFams : function(){
		var count = 0
		for (var fam in familyMapOps._map){
			count ++
		}
		return count;
	},

	numPercs: function( famid ){
		var count = 0;
		for (var perc in familyMapOps._map[famid]){
			count ++;
		}
		return count;
	},

	/* Grab the first individual */
	getFirst: function( family_id ){
		for (var fam in familyMapOps._map)
			for (var ped in familyMapOps.getFam(fam))
				return familyMapOps.getPerc(ped,fam);

		return -1
	},

	_loginsertion: function(person_id,family_id){
		var key = family_id+"_"+person_id;
		familyMapOps._insertionLog[key] = familyMapOps._insertionLog[key] + 1 || 1;
		return familyMapOps._insertionLog[key];
	},


	insertPerc: function(person, family_id){
		
		if (!(family_id in familyMapOps._map)){
			familyMapOps._map[family_id] = {}
			console.log("FMO: added new fam " + family_id);
		}
		
		var num_attempts = familyMapOps._loginsertion(person.id, family_id);		

		if (!(person.id in familyMapOps._map[family_id])){
			familyMapOps._map[family_id][person.id] = person;
			return 0;
		}

		if (num_attempts >2){
			console.log(person.id,"already in", family_id, num_attempts, "times")
		}
		return -1;
	},

	getFam: function(family_id){
		if (familyMapOps.famExists(family_id)){
			return familyMapOps._map[family_id];
		}
		return -1;
	},

	removeFam: function(family_id){
		if (familyMapOps.famExists(family_id)){
			delete familyMapOps._map[family_id];
			return 0;
		}
		return -1;
	},

	famExists: function(family_id){
		return (family_id in familyMapOps._map);
	},

	percExists: function(person_id, family_id){
		if (familyMapOps.famExists(family_id)){
			return (person_id in familyMapOps.getFam(family_id));
		}
		return false;
	},

	removePerc: function(person_id, family_id)
	{
		if (family_id in familyMapOps._map){
			if (person_id in familyMapOps._map[family_id]){
				delete familyMapOps._map[family_id][person_id];
				return 0;
			}
			console.log(person_id,"not in", family_id)
			return -1;
		}
		console.log(family_id, "not in map");
		return -1;
	},

	getPerc: function(person_id, family_id)
	{
		if (family_id in familyMapOps._map){
			if (person_id in familyMapOps._map[family_id]){
				return familyMapOps._map[family_id][person_id];
			}
			console.log(person_id,"not in", family_id)
			return -1;
		}
		console.log(family_id, "not in map");
		return -1;
	}
}
