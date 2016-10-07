
var FlowResolver = {

	unique_haplos : [], // accessed by Merlin

	initFounderAlleles : function(){
		FounderColor.hgroup = FlowResolver.unique_haplos;
	},

	child2parent_link: function(child, mother, father, fam){
		
//		console.log(child, mother, father)

		var chil_allele1 = child.haplo_data[0],
			moth_allele1 = mother.haplo_data[0],
			fath_allele1 = father.haplo_data[0];


		var chil_allele2 = child.haplo_data[1],
			moth_allele2 = mother.haplo_data[1],
			fath_allele2 = father.haplo_data[1];


		//console.log("Attempting", child.id, fam, chil_allele1.pter_array, chil_allele1.flow)

		var i = -1
		while(++i < chil_allele1.flow.length)
		{
			// Map allele.flow -> allele.pter_array	color group array
			chil_allele1.pter_array[i].color_group = [chil_allele1.flow[i]];
			moth_allele1.pter_array[i].color_group = [moth_allele1.flow[i]];
			fath_allele1.pter_array[i].color_group = [fath_allele1.flow[i]];
			
			chil_allele2.pter_array[i].color_group = [chil_allele2.flow[i]];
			moth_allele2.pter_array[i].color_group = [moth_allele2.flow[i]];
			fath_allele2.pter_array[i].color_group = [fath_allele2.flow[i]];

			//console.log(i, fam, child.id, mother.id, father.id)

		}

		//console.log("Result?", child.id, fam, chil_allele1.pter_array, chil_allele1.flow)
	}
}