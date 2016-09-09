// Each locus in each person's allele has {data} and a {founder pointer}
class Allele {

	constructor(data){
		this.data_array = new Int8Array(data);
		this.pter_array = [];
		// points to the founder allele group (retrieved from parent, and recursively points to founder allele group)

		//In order to pass pointers, I need to add properties to color_groups
		for (var i=0; i < data.length; i++)
			this.pter_array.push( {color_group: []} ); 	//Array due to phase ambiguity

		this.haplogroup_array;
		this.unique_groups = [];
		// ^ Empty until pter_array is completely unambiguous, where pter_array is then deleted (dereferenced, left for GC)
	}

	getLength(){
		return this.data_array.length
	}

	debug(){
		return {
			data: this.data_array,
			groups: (this.pter_array.map(
				function (n){
					return ""+n.color_group+"";
				}
			)),
			unique: this.unique_groups
	// 				).reduce(
	// 			function (s,a){
	// 				return s+"],["+a;
	// 			})
		};
	}
}