var familyMapOps = {

	_map : {}, // fam_id ---> pedigree map --> person

	_insertionLog : {}, // famid+pedid : counter of how many times attempted insertion
						// should not exceed 2 (per allele line from pedfile)

	clear: function(){
		familyMapOps._map = {}; // reset
	},


	foreachfam: function( callback ){
		for (var fam in familyMapOps._map){
			callback(fam, familyMapOps.getFam(fam));
		}
	},

	/* If fam_id given, it just iterates over people in the specified famid */
	foreachperc: function( callback, fam_id = null ){
		if (fam_id === null){
			for (var fid in familyMapOps._map){
				for (var pid in familyMapOps.getFam(fid)){
					callback(pid, fid,
						familyMapOps.getPerc(pid,fid)
					);
				}
			}
		}
		else{
			for (var pid in familyMapOps.getFam(fam_id)){
				callback(pid,
					familyMapOps.getPerc(pid,fam_id)
				);
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


	getRandomPerc: function(){
		for (var fam in familyMapOps._map){
			return familyMapOps.getFirst(fam);
		}
		error("No families");
	},

	/* Grab the first individual */
	getFirst: function( family_id ){
		for (var ped in familyMapOps.getFam(family_id)){
			return familyMapOps.getPerc(ped,family_id);
		}

		return -1
	},

	_loginsertion: function(person_id,family_id){
		var key = family_id+"_"+person_id;
		familyMapOps._insertionLog[key] = familyMapOps._insertionLog[key] + 1 || 1;
		return familyMapOps._insertionLog[key];
	},


	_insertPercAsChild: function(person, family_id){
		if (person.mother !== 0){
			person.mother.addChild(person);
		}
		if (person.father !== 0){
			person.father.addChild(person);
		}
	},

	_removePercAsChild: function(person, family_id){
		if (person.mother !== 0){
			person.mother.removeChild(person);
		}
		if (person.father !== 0){
			person.father.removeChild(person);
		}
	},

	_removePercAsMate: function(person, family_id){
		if (person.mates.length > 0){
			person.foreachmate(function(mate){
				mate.removeMate(person);
			});
		}
	},

	_removePercAsParent: function(person, family_id){
		if (person.children.length > 0){
			var isMother = person.gender === PED.FEMALE;

			person.foreachmate(function(mate)
			{
				person.foreachchild(mate, function(child){
					if (isMother){
						child.mother = 0;
					} else {
						child.father = 0;
					}
				});
			});
		}
	},

	/* used outside of default insertPerc function*/
	insertPercAsParent: function(person, family_id, children){
		var isMother = person.gender === PED.FEMALE;

		for (var c=0; c < children.length; c++){
			if (isMother){
				children[c].mother = person;
			} else {
				children[c].father = person;
			}
		}
	},

	updatePerc: function(old_id, person, family_id){
		var oldperson = familyMapOps.getPerc(old_id, family_id);

		oldperson.id = person.id;
		oldperson.name = person.name;
		oldperson.gender = person.gender;
		oldperson.affected = person.affected;
	},


	updateIntoPerc: function(old_id, person, family_id)
	{
		if (familyMapOps.percExists(old_id, family_id)){
			familyMapOps.updatePerc(old_id,person, family_id);
			return 0;
		}

		familyMapOps.insertPerc(person, family_id);
	},


	insertPerc: function(person, family_id){

		if (!(family_id in familyMapOps._map)){
			familyMapOps._map[family_id] = {}
			console.log("FMO: added new fam", family_id);
		}

		var num_attempts = familyMapOps._loginsertion(person.id, family_id);

		if (!(person.id in familyMapOps._map[family_id])){
			familyMapOps._map[family_id][person.id] = person;
			//familyMapOps._insertPercAsChild(person, family_id);

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
			if (person_id in familyMapOps._map[family_id])
			{
				var person = familyMapOps.getPerc(person_id, family_id);

				familyMapOps._removePercAsChild(person, family_id);
				familyMapOps._removePercAsMate(person, family_id);
				familyMapOps._removePercAsParent(person, family_id);

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
		if (person_id in familyMapOps._map[family_id]){
			return familyMapOps._map[family_id][person_id];
		}
		error(person_id + " not in " + family_id);
	},

	inferGenders : function(family_id = null){

		familyMapOps.foreachperc(function(pid,fid,perc){

			if (perc.gender === PED.UNKNOWN){
				//console.log("unknown", perc.id, perc.children);

				if (perc.children.length > 0){
					var firstChild = perc.children[0];

					var mother_id = firstChild.mother.id,
						father_id = firstChild.father.id;

					//console.log("unknown has kids", perc.id, mother_id, father_id);

					if (mother_id === perc.id){
						perc.gender = PED.FEMALE;
					}
					else if (father_id === perc.id){
						perc.gender = PED.MALE
					}
					else {
						error(perc, firstChild);
					}
				}
			}
		}, family_id);
	},


	/** Members of the same family are actually related via some DOS */
	areConnected: function(perc1_fam_id, perc1_id, perc2){

		let perc1 = familyMapOps.getPerc(perc1_id, perc1_fam_id),
			perc2_id = Number(perc2);

		var traversed = {};

		function recurseSearch(perc){
			if (perc === 0){
				return 0;
			}

			if (perc.id in traversed){
				return 0;
			}
			traversed[perc.id] = 1;

			if (perc.id === perc2_id){
				return true;
			}


			for (var m=0; m < perc.mates.length; m++){
				let mate = perc.mates[m];
				let res00 = recurseSearch(mate);
				if (res00 === true){
					return true;
				}

				for (var c =0; c < perc.children.length; c++){
					let child = perc.children[c];
					let res01 = recurseSearch(child);
					if (res01 === true){
						return true;
					}
				}
			}

			// Parents
			let res1 = recurseSearch( perc.mother);
			let res2 = recurseSearch( perc.father);

			if (res1  === true || res2  === true){
				return true
			}
			return false;
		}
		return recurseSearch(perc1);
	}
}
