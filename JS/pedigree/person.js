// This should not be optimized for graphics, this is for data processing only(!!)
//
class Person {

	constructor(id, gender, affected, mother = 0, father = 0, name = null)
	{
		this.id = Number(id);
		this.gender = Number(gender);     // 1 - male, 2-female, 0-unknown
		this.affected = Number(affected); // 0,1,2

		this.mother = Number(mother);
		this.father = Number(father);
		this.haplo_data = [];  			// [Allele1, Allele2]

		this.mates = [];
		this.children = [] 				// added by connect method later

		//Optional
		this.name = name;

		//Placeholder to be immediately deleted after read
		this.stored_meta;
	}

	insertDescentData(normal_array){

		if (this.haplo_data[0].descent === null){
			this.haplo_data[0].addDescent(normal_array) // paternal
			return 0;
		}

		if (this.haplo_data[1].descent === null){
			this.haplo_data[1].addDescent(normal_array); //maternal
			return 0;
		}
		error(this.id+" already has populated Alleles");
	}

	insertFlowData(normal_array){

		if (this.haplo_data[0].flow === null){
			this.haplo_data[0].addFlow(normal_array) // paternal
			return 0;
		}

		if (this.haplo_data[1].flow === null){
			this.haplo_data[1].addFlow(normal_array); //maternal
			return 0;
		}
		error(this.id+" already has populated Alleles");
	}


	setHaplogroupArray(normal_array){
		if (this.haplo_data[0].haplogroup_array === null){
			this.haplo_data[0].haplogroup_array = new Int8Array(normal_array);
			return 0;
		}

		if (this.haplo_data[1].haplogroup_array === null){
			this.haplo_data[1].haplogroup_array = new Int8Array(normal_array);
			return 0;
		}
		error(this.id+" already has haplogroups set!");
	}


	insertHaploData(normal_array){
		var num_alleles = this.haplo_data.length;

		if (num_alleles === 0){
			this.haplo_data.push( new Allele(normal_array) );
			return 0;
		}
		if (num_alleles === 1){
			var chromlen = this.haplo_data[0].getLength();
			if (chromlen === normal_array.length){
				this.haplo_data.push( new Allele(normal_array) );
				return 0;
			}
			console.log(this);
			error(this.id+" Allele sizes not consistent! "+chromlen+" vs "+normal_array.length);
		}
		error(this.id+" already has populated Alleles");
	}

	// Identical in relationships
	isDoppelGanger(pers2){
		if ((this.mother === pers2.mother) && (this.father && pers2.father)){
			if (this.mates.length === pers2.mates.length){
				for (var c=0; c < this.mates.length; c++){
					if (this.mates[c].id !== pers2.mates[c].id){
						return false;
					}
				}

				if (this.children.length === pers2.children.length){
					for (var c=0; c < this.children.length; c++){
						if (this.children[c].id !== pers2.children[c].id){
							return false
						}
					}
					return true;
				}
			}
		}
		return false;
	}

	isMate(pers2){
		var compare = pers2;
		if (pers2 === 0){
			compare = {id:0}
		}

		for (var m=0; m < this.mates.length; m++){
			if (compare.id == this.mates[m].id){return true};
		}
		return false;
	}

	foreachmate(callback){
		for (var m=0; m < this.mates.length; m++){
			var mate = this.mates[m];
			callback(mate, m);
		}
	}

	foreachchild(mate, callback){

		var common_children = intersectArrays(this.children, mate.children)

		for (var c=0; c < common_children.length; c++){
			var child = common_children[c];
			callback(child, c);
		}
	}

	hasHaplo(){
		return this.haplo_data.length > 1 && this.haplo_data[0].haplogroup_array !== null;
	}

	hasChild(child){
		for (var c=0; c < this.children.length; c++){
			if (child.id === this.children[c].id){return true};
		}
		return false;
	}

	isFounder(){
		return (this.mother === 0 && this.father === 0);
	}

	addMate(mate){
		// Already exists
		if (this.isMate(mate)){
			return -1;
		}
		this.mates.push(mate);
	}

	removeMate(mate){
		if (this.isMate(mate)){
			var mate_index = this.mates.map(function(a){return a.id;}).indexOf(mate.id);
			if (mate_index !== -1){
				this.mates.splice(mate_index,1);
				return 0;
			}
		}
		return -1
	}

	addChild(child){
		// Already exists
		if (this.hasChild(child)){
			return -1;
		}
		this.children.push(child);
	}

	removeChild(child){
		if (this.hasChild(child)){
			var child_index = this.children.map(function(a){return a.id;}).indexOf(child.id)
			if (child_index !== -1){
				this.children.splice(child_index,1);
				return 0
			}
		}
		return -1
	}
}
