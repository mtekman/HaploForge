
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
        console.log(BenchPerson.generation_map);
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

        // First generation root individuals *must* have a mate
        let hasMate = (gen_modif * Math.random()) > 0.5 || generation === 0;
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


    populateGraphics(){
        this.__insertIntoGlobalMaps();
    }


    __insertIntoGlobalMaps(){

        var fam = 9999;

        for (let gen in BenchPerson.generation_map)
        {
            let indivs = BenchPerson.generation_map[gen]
            for (let i in indivs){
                let ind = indivs[i];

                let mat = ind.mother === null?0:ind.mother.id,
                    pat = ind.father === null?0:ind.father.id;

                let pers = new Person(ind.id, ind.gender, ind.affected, mat, pat);
                pers.insertHaploData( ind.__temp_haplo_data[0] )
                pers.insertHaploData( ind.__temp_haplo_data[1] )
                familyMapOps.insertPerc(pers, fam);  
            }
            //console.log(gen, indivs);
        }
    }
}

