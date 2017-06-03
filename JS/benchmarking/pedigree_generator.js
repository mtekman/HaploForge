
class TreeGenerator {

	constructor(){
		this.max_generations = 8;
		this.chance_of_inbreeding = 0.1;

		// To be filled
		this.num_people = 0;

		let root_indiv = new BenchPerson(0); // generation 0

		this.germinate(root_indiv);
	}

	germinate(perc){
		console.log("Germinate", perc)
		// Perc is a pre-existing individual of unknown gender

		// first generations have higher chance of mating and producing more kids
		let generation = perc.generation
		let gen_modif = this.max_generations - generation;	

		if (gen_modif === 0){
			// reached max generation
			return 0
		}

		let hasMate = (gen_modif * Math.random()) > 0.5;
		if (hasMate){
			let perc_gender = perc.gender,
				mate_gender = perc_gender===2?1:2;

			let mate = null;			
			if (this.chance_of_inbreeding < Math.random()){
				// Mate is a cousin
				mate = perc.findAvailableCousin()
				console.log("cousin mate", mate);
			}

			if (mate === null){ // No cousin match, or new founder
				// Mate is a new founder
				mate = new BenchPerson(generation, mate_gender, 0, 0)
				console.log("random mate", mate);
			}

			perc.addMate(mate);
			mate.addMate(perc);

			let father = perc_gender===1?perc:mate;
			let mother = perc_gender===2?perc:mate;

			// All mates must produce at least 1 offspring 
			let numOff = 1 + randomIndex(gen_modif)
			for (let n=0; n < numOff; n++)
			{
				let child = new BenchPerson(generation+1, 0, mother.id, father.id)
				perc.addChild(child);
				mate.addChild(child);

				// and recurse
				this.germinate(child)
			}
		}
		return 0;
	}
}


class BenchPerson  extends Person {

	init(){
		if (BenchPerson.generation_map === undefined){
			BenchPerson.generation_map = {}
		}
	}

	constructor(generation, gender = 0, mother = null, father = null) {
		super();

		this.init();

		this.generation = generation;
		this.gender = gender === 0?this.randomGender():gender;
		
		this.id = this.randomID(generation, gender)

		this.mother = mother
		this.father = father
		this.affected = 1;  // innocent until proven guilty


		if (this.mother !== null){         // Non-Founder
			this.haplo_data = this.simulateMeiosis()
		}
		else {
			this.haplo_data = this.generateFounderAlleles(); // Founder
		}
	}

	findAvailableCousin(){
		let cousins = BenchPerson.generation_map[this.generation]; // Same generation

		for (let c_id in cousins){
			let cousin = cousins[c_id];

			if (cousin.mother === null){ 
				continue;
			}

			if (cousin.mother.id !== this.mother.id || cousin.father.id !== this.father.id){
				// Not sibs or half-sibs
				if (cousin.gender !== this.gender){   // straight
					if (!cousin.hasChild){             // single
						console.log("inbreeding:", this.id, cousin.id);
						return cousin;
					}
				}
			}
		}
		// no matches found
		return null;
	}


	simulateMeiosis(){
		this.haplo_data.push( BenchAllele.performMeiosis(this.mother.haplo_data[0], this.mother.haplo_data[1]) )
		this.haplo_data.push( BenchAllele.performMeiosis(this.father.haplo_data[0], this.father.haplo_data[1]) )
	}

	generateFounderAlleles(){
		this.haplo_data.push( BenchAllele.newNonDiseaseAllele() )
		this.haplo_data.push( BenchAllele.newNonDiseaseAllele() )
	}

	randomGender(){
		return 1 + randomIndex(2);
	}

	randomID(generation, gender, modif = 1){
		let ext = gender * modif, // males odd, females even,
			num = (generation * 1000) + ext;

		if (!(generation in BenchPerson.generation_map)){
			BenchPerson.generation_map[generation] = {}
		}
		
		if (!(num in BenchPerson.generation_map[generation])){
			BenchPerson.generation_map[generation][num] = this;
			return num;
		} else {
			// recurse
			return this.randomID(generation, gender, modif + 1);
		}
	}
}



