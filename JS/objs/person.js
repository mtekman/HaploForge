// This should not be optimized for graphics, this is for data processing only(!!)
//
class Person {

	constructor(id, gender, affected, mother = 0, father = 0, name = null){
		this.id = id;
		this.gender = gender;	         // 1 - male, 2-female, 0-unknown
		this.affected = affected ; 	     // 0,1,2

		this.mother = mother; this.father = father;
		this.haplo_data = [];  			// marker_index ---> {data:, hgroup:}

		this.mates = [];
		this.children = [] 				// added by connect method later

		//Optional
		this.name = name;
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

	hasHaplo(){
		return this.haplo_data.length > 0;
	}

	isChild(pers2){
		for (var c=0; c < this.children.length; c++){
			if (pers2.id == this.children[c].id){return true};
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

	addChild(child){
		// Already exists
		if (this.isChild(child)){
			return -1;
		}
		this.children.push(child);
	}
}