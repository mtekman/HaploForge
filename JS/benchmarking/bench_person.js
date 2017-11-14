import Person from '/JS/pedigree/person.js';
import BenchAllele from '/JS/benchmarking/bench_allele.js';

export class BenchPerson  extends Person {

	init(){
		if (BenchPerson.generation_map === undefined){
			BenchPerson.generation_map = {}
		}
	}

	constructor(generation, gender = 0, mother = null, father = null) {
		super();

		this.init();

		this.generation = generation;
		this.gender = ((gender===0)?this.randomGender():gender);

		try {
			this.id = this.randomID()
		} catch (rangerror){
			location.refresh(true)
		}

		this.mother = mother
		this.father = father


		this.__temp_haplo_data = []
		this.num_recombinations = 0;

		if (this.mother !== null){
		    this.simulateMeiosis();        // Non-Founder
		}
		else {
		    this.generateFounderAlleles(); // Founder
		}

		this.affected = this.determineAffectation(); // has the right disease allele locus ?
	}

	determineAffectation(){
		return 1; // TODO
	}

	findAvailableCousin(){
		let cousins = BenchPerson.generation_map[this.generation]; // Same generation

		let already_married_match = null;

		for (let c_id in cousins)
		{
			let cousin = cousins[c_id];

			if (cousin.mother === null){ continue; }
		    if (cousin.gender === this.gender){ continue; } // Straight
		    if (cousin.mother.id === this.mother.id || cousin.father.id === this.father.id){ continue; }

		     // Available? If can't find a match use this indiv
		    if (cousin.mates.length > 0){
		    	already_married_match = cousin;
		    	continue;
		    }
		    //  console.log("inbreeding:", this.id, cousin.id);
		    return cousin;
		}

		return already_married_match; // null if no matches found
	}


	simulateMeiosis(){
		let all1 = BenchAllele.performMeiosis(this.mother.__temp_haplo_data[0], this.mother.__temp_haplo_data[1]);
		let rec1 = BenchAllele.__recombination_occurred;

		let all2 = BenchAllele.performMeiosis(this.father.__temp_haplo_data[0], this.father.__temp_haplo_data[1]);
		let rec2 = BenchAllele.__recombination_occurred;

		this.num_recombinations = 0;
		if (rec1){ this.num_recombinations += 1;}
		if (rec2){ this.num_recombinations += 1;}

		this.__temp_haplo_data.push( all1 )
		this.__temp_haplo_data.push( all2 )
	}

	generateFounderAlleles(){
		this.__temp_haplo_data.push( BenchAllele.newNonDiseaseAllele() )
		this.__temp_haplo_data.push( BenchAllele.newNonDiseaseAllele() )
	}

	randomGender(){
		return 1 + randomIndex(2);
	}

	randomID(modif = 1){

		let ext = this.gender * modif, // males odd, females even,
		num = (this.generation * 10000) + ext;

		//console.log("generation", this.generation, num, modif, ext)
		if (!(this.generation in BenchPerson.generation_map)){
			BenchPerson.generation_map[this.generation] = {}
		}

		if (num in BenchPerson.generation_map[this.generation]){
			return this.randomID(modif + 1);
		}

		// Otherwise result
		BenchPerson.generation_map[this.generation][num] = this;
		return num
	}
}
