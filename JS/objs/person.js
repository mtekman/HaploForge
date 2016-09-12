// This should not be optimized for graphics, this is for data processing only(!!)
//
class Person {

	constructor(id, gender, affected, mother = 0, father = 0, name = null){
		this.id = id;
		this.gender = gender;	         // 1 - male, 2-female, 0-unknown
		this.affected = affected ; 	     // 0,1,2

		this.mother = mother; this.father = father;
		this.haplo_data = [];  			// [Allele1, Allele2]

		this.mates = [];
		this.children = [] 				// added by connect method later

		//Optional
		this.name = name;
	}

	export(){
		return [this.id,
			this.mother.id||0,
			this.father.id||0,
			this.gender,
			this.affected,
			this.name||"null",
			this.haplo_data[0].data_array.join(" "),
			this.haplo_data[1].data_array.join(" ")
			].join(",");
	}

	import(string){
		var tokens = string.split(",");

		var id = parseInt(tokens[0]),
			mother_id = parseInt(tokens[1]),
			father_id = parseInt(tokens[2]),
			gender = parseInt(tokens[3]),
			affected = parseInt(tokens[4]),
			
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
			throw new Error(this.id+" Allele sizes not consistent! "+chromlen+" vs "+normal_array.length);
		}
		throw new Error(this.id+" already has populated Alleles");
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
		return this.haplo_data.length > 0;
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