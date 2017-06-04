
class TreeGenerator {

    constructor(num_roots, num_gens, allele_size = 16, inbreed_chance = 0.1)
    {
	if (num_gens === undefined){
	    console.log("give root and generations");
	    return 0;
	}

	BenchAllele.allele_size = allele_size;
	
	this.max_generations = num_gens;
	this.chance_of_inbreeding = inbreed_chance;

	// To be filled
	this.num_people = 0;
	this.inbred_couples = {};

	for (let i=0; i < num_roots; i++)
	{
	    let root_indiv = new BenchPerson(1); // generation 0
	    this.germinate(root_indiv);    
	}

	this.printmetrics()
    }

    printmetrics(){
	console.log("Num people:", this.num_people)

	let inco = [ for (i of Object.keys(this.inbred_couples)) i];
	
	console.log("Inbred couples", inco.length, inco)
	console.log("Generations",
		    [for (i of Object.keys(BenchPerson.generation_map))
		     i+": "+Object.keys(BenchPerson.generation_map[i]).length ]
		   )
    }
    

    germinate(perc){
	// Perc is a pre-existing individual of unknown gender

	// first generations have higher chance of mating and producing more kids
	// lower generations have higher chance of inbreeding
	let generation = perc.generation
	let gen_modif = this.max_generations - generation;

	this.num_people += 1
	//console.log("Germinate", perc.id, generation, gen_modif, this.num_people)

	if (gen_modif === 0){
	    // reached max generation
	    return 0
	}

	let hasMate = (gen_modif * Math.random()) > 0.5;
	if (hasMate){
	    let perc_gender = perc.gender,
		mate_gender = perc_gender===2?1:2;

	    let mate = null;			
	    if (this.chance_of_inbreeding * (generation / this.max_generations ) > Math.random()){
		// Mate is a cousin
		mate = perc.findAvailableCousin()
	    }

	    if (mate !== null){
		this.inbred_couples[perc.id + "__" + mate.id] = true
	    }
	    else {
		// Mate is a new founder
		mate = new BenchPerson(generation, mate_gender, null, null)
		//console.log("random mate", mate);
	    }

	    perc.addMate(mate);
	    mate.addMate(perc);

	    let father = perc_gender===1?perc:mate;
	    let mother = perc_gender===2?perc:mate;

	    // All mates must produce at least 1 offspring 
	    let numOff = 1 + randomIndex(gen_modif)
	    //console.log("   kids:", numOff)
	    for (let n=0; n < numOff; n++)
	    {
		let child = new BenchPerson(generation + 1, 0, mother, father)
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
	this.gender = ((gender===0)?this.randomGender():gender);
	
	this.id = this.randomID()

	this.mother = mother
	this.father = father
	this.affected = 1;  // innocent until proven guilty


	if (this.mother !== null){         // Non-Founder
	    this.simulateMeiosis()
	}
	else {
	    this.generateFounderAlleles(); // Founder
	}
    }

    findAvailableCousin(){
	let cousins = BenchPerson.generation_map[this.generation]; // Same generation

	for (let c_id in cousins)
	{
	    let cousin = cousins[c_id];

	    if (cousin.mother === null){ continue; }    
	    if (cousin.mother.id === this.mother.id || cousin.father.id === this.father.id){ continue; } // Not Sibs
	    if (cousin.gender === this.gender){ continue; } // Straight
	    if (cousin.mates.length > 0){ continue; } // Available
	    //  console.log("inbreeding:", this.id, cousin.id);	    
	    return cousin;
	}
	return null; // no matches found
    }


    simulateMeiosis(){
	this.haplo_data.push( BenchAllele.performMeiosis(
	    this.mother.haplo_data[0], this.mother.haplo_data[1]) )
	this.haplo_data.push( BenchAllele.performMeiosis(
	    this.father.haplo_data[0], this.father.haplo_data[1]) )
    }

    generateFounderAlleles(){
	this.haplo_data.push( BenchAllele.newNonDiseaseAllele() )
	this.haplo_data.push( BenchAllele.newNonDiseaseAllele() )
    }

    randomGender(){
	return 1 + randomIndex(2);
    }

    randomID(modif = 1){
	
	let ext = this.gender * modif, // males odd, females even,
	    num = (this.generation * 1000) + ext;

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



