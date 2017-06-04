function randomIndex(len){
    return Math.floor(Math.random() * len);
}


var BenchAllele  = {

    disease_allele : null,
    allele_size : 16,
    __alleles_in_use : {},


    newNonDiseaseAllele: function()
    {
	if (BenchAllele.disease_allele === null)
	{
	    BenchAllele.disease_allele = [];
	    for (let i=0; i < BenchAllele.allele_size; i++){ BenchAllele.disease_allele.push(1); }
	    
	    BenchAllele.__alleles_in_use[ BenchAllele.disease_allele.join("") ] = true;

	    console.log("Defining new disease_allele", BenchAllele.disease_allele);
	};

	let new_all = [for (i of BenchAllele.disease_allele) [1,2][randomIndex(2)]]
	let key = new_all.join("")

	// Each FA must be unique
	if (key in BenchAllele.__alleles_in_use){
	    return BenchAllele.newNonDiseaseAllele();
	}

	BenchAllele.__alleles_in_use[key] = true
	return new_all;
    },

    performMeiosis: function(all1,all2)
    {
	if ( all1.length !== all2.length){
	    console.error("Allele lengths do not match");
	    return 0;
	}

	let buff = Math.floor(all1.length / 2);
	let allele_len = buff + all1.length + buff; // buffer on each side
	// if number falls in 0:5 or -5:1, then no recombination occurs

	let index_split = randomIndex(allele_len);

	if (index_split < buff)             { return all1;}
	if (index_split > allele_len - buff){ return all2;}

	// Otherwise recombination
	index_split -= buff;
	return all1.slice(0,index_split).concat(all2.slice(index_split,));
    }
}
