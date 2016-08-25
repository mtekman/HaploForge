// Each locus in each person's allele has {data} and a {founder pointer}
var Allele = function(data){
	this.data_array = new Int8Array(data);
	this.pter_array = [];
	// points to the founder allele group (retrieved from parent, and recursively points to founder allele group)

	//In order to pass pointers, I need to add properties to color_groups
	for (var i=0; i < data.length; i++)
		this.pter_array.push( {color_group: []} ); 	//Array due to phase ambiguity

	this.haplogroup_array;
	this.unique_groups = [];
	// ^ Empty until pter_array is completely unambiguous, where pter_array is then deleted (dereferenced, left for GC)


};

Allele.prototype.debug = function(){
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
};


// This should not be optimized for graphics, this is for data processing only(!!)
//
var Person = function(id, gender, affected, mother = 0, father = 0, name = null){
	this.id = id;
	this.gender = gender;	         // 1 - male, 2-female, 0-unknown
	this.affected = affected ; 	     // 0,1,2

	this.mother = mother; this.father = father;
	this.haplo_data = [];  			// marker_index ---> {data:, hgroup:}

	this.mates = [];
	this.children = [] 				// added by connect method later

	//Optional
	this.name = name;
};

Person.prototype.isMate = function(pers2){
	var compare = pers2;
	if (pers2 === 0){
		compare = {id:0}
	}

	for (var m=0; m < this.mates.length; m++)
		if (compare.id == this.mates[m].id) return true;
	return false;
}

Person.prototype.isChild = function(pers2){
	for (var c=0; c < this.children.length; c++)
		if (pers2.id == this.children[c].id) return true;
	return false;
}

Person.prototype.isFounder = function(){
	return (this.mother === 0 && this.father === 0);
}

Person.prototype.addMate = function(mate){
	// Already exists
	if (this.isMate(mate)){
		return -1;
	}
	this.mates.push(mate);
}

Person.prototype.addChild = function(child){
	// Already exists
	if (this.isChild(child)){
		return -1;
	}
	this.children.push(child);
}



// Conjoined map, needed for pedigree but would recurse infinitely for graphics
//
function connectAllIndividuals()
{
	familyMapOps.foreachperc(function(id,famid)
	{
		var new_root = familyMapOps.getPerc(id, famid);      //Assign father and mother to actual people
		var pers_father = 0, pers_mother = 0;

		if (new_root.father != 0) {
			pers_father = familyMapOps.getPerc(new_root.father, famid);

			new_root.father = pers_father;         // Add father to child
			pers_father.addChild(new_root);   // And child to father
		}

		if (new_root.mother != 0){
			pers_mother = familyMapOps.getPerc(new_root.mother,famid);

			new_root.mother = pers_mother;         // Add mother to child
			pers_mother.addChild(new_root);   // And child to mother
		}

		if (pers_father != 0 )                     //Add parents as mates to each other
			if(pers_mother != 0) pers_father.addMate(pers_mother);
			else pers_father.addMate(0);

		if (pers_mother !=0 )
			if(pers_father != 0) pers_mother.addMate(pers_father);
			else pers_mother.addMate(0);
	});
	
	// Make a total
	familyMapOps.foreachfam(function(famid){
		var num_peeps = 0;
		familyMapOps.foreachperc(function(){
			num_peeps ++;
		}, famid);
		familyMapOps.getFam(famid).family_size = num_peeps;
	});
}

//var groupNodes = function(){
//	"Looks for the longest common substring of an allele, recursively searching up from offspring to founder"
//}

// Must be called AFTER populateGrids
function determinePedigreeType()
{
	// Affecteds in each generation --> dominant
	// if males have one allele --> sexlinked (easy):
	//      if males have two alleles, but one of them is always zero --> sexlinked
	//
	// extra (unnecesary) checks:
	//      if dominant and male-to-male transmission --> autosomal
	//      if recessive and males are hemizygous and not all females are affected --> sexlinked

	// We assume that all pedigrees are on the same chromosome -- pick the largest to examine.
	var ped_id = (function largestPedigree(){
		var max_memb=0, max_fam=0;

		for (var fid in generation_grid_ids)
		{
			var num_memb = 0;

			for (var g = 0; g < generation_grid_ids[fid].length; g++)
				num_memb += generation_grid_ids[fid][g].length;

			if (num_memb > max_memb){
				max_memb = num_memb;
				max_fam = fid;
			}
		}
		return max_fam;
	})();

	SEXLINKED = function singleAlleleMale(){
		var all_zero_Ychroms = 0;
		var num_males_checked = 0;

		var num_males_with_single_allele = 0;

		for (var g =0; g < generation_grid_ids[ped_id].length; g++)
		{
			for (var p=0; p < generation_grid_ids[ped_id][g].length; p++)
			{
				var perc_id = generation_grid_ids[ped_id][g][p],
					perc = familyMapOps.getPerc(perc_id,ped_id);

				//Determine if Y allele is zero for ALL males (not just one)
				if ( perc.gender == MALE ){
					if (perc.haplo_data.length == 1)
						num_males_with_single_allele ++;

					else {
						var num_all_zero_alleles = 0;

						for (var a=0; a < perc.haplo_data.length; a++){
							var all_zeroes = true;

							for (var i=0; i < perc.haplo_data[a].data_array.length; i++ ){
								if (perc.haplo_data[a].data_array[i] !== 0){
									all_zeroes = false;
									break;
								}
							}
							if (all_zeroes)
								num_all_zero_alleles ++;
						}
						if (num_all_zero_alleles === 2)
							continue;  // skip this guy, completely uninformative

						all_zero_Ychroms += num_all_zero_alleles;

					}
					num_males_checked ++;
				}
			}
		}
		if (num_males_with_single_allele === num_males_checked) return true;
		if (all_zero_Ychroms === num_males_checked) return true;
		if (num_males_with_single_allele + all_zero_Ychroms === num_males_checked) return true;

		return false;
	}();

	DOMINANT = function checkAffectedsInGens(){
		var affected_in_each_gen = 0,
			num_gens = generation_grid_ids[ped_id].length;

		for (var g =0; g < generation_grid_ids[ped_id].length; g++)
		{
			var affecteds_in_gen = 0

			for (var p=0; p < generation_grid_ids[ped_id][g].length; p++)
			{
				var perc_id = generation_grid_ids[ped_id][g][p],
					perc = familyMapOps.getPerc(perc_id,ped_id);

				if (perc.affected === AFFECTED)
					affecteds_in_gen ++;
			}
			if (affecteds_in_gen > 0) affected_in_each_gen ++;
		}

		return affected_in_each_gen === num_gens;
	}();

	console.log("sexlinked=", SEXLINKED)
	console.log("dominant=", DOMINANT)


	if (SEXLINKED){
		(function addZeroAllele_for_sexlinkedMales()
		{
			// Triple loop just as effective for double for non-repeating indivs
			for (var fid in generation_grid_ids){
				for (var gen = 0; gen < generation_grid_ids[fid].length; gen ++){
					for (var mem = 0; mem < generation_grid_ids[fid][gen].length; mem ++)
					{
						var perc_id = generation_grid_ids[fid][gen][mem],
							perc = familyMapOps.getPerc(perc_id,fid);

						if (perc.gender === MALE && perc.haplo_data.length === 1)
						{
							var len_of_allele = perc.haplo_data[0].data_array.length,
							new_allele = []

							for (var i=0; i < len_of_allele ; i++)
								new_allele.push(0);

							perc.haplo_data.push(new Allele(new_allele))
						}
					}
				}
			}
		})();
	}
}
