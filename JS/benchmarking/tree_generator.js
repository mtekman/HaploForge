
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
    }

    printmetrics(){
        /*console.log(" [Results: num_people=" + this.num_people + "inbred_couples=" + Object.keys(this.inbred_couples).length + "] ");
        console.log("   Inbred_couples=", this.inbred_couples)
        console.log("   Generations", Object.keys(BenchPerson.generation_map).map( i => i+": "+Object.keys(BenchPerson.generation_map[i]).length ), BenchPerson.generation_map);*/
        return { numpeople: this.num_people, numinbredcouples: Object.keys(this.inbred_couples).length };
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
        let hasMate = (gen_modif * Math.random()) > 0.5 || generation < 2;
        if (hasMate){
            let perc_gender = perc.gender,
            mate_gender = perc_gender===2?1:2;

            let mate = null,
                breeding_chance = this.chance_of_inbreeding * (generation / this.max_generations);

            if (breeding_chance > Math.random()){
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


    __transposedHeaders(num, initial_buff, spacer){
        // Make regular headers
        var markers = [];
        for (let i = 1; i <= num ; i++){
            let nn = "" + i + "",
                nlen = nn.length;

            let name = "mm1000000";
            name = name.slice(0,-nlen) + nn
            markers.push( name );
        }

        // Transpose
        let str_array = "";

        for (let i = markers[0].length -1 ; i >= 0; i--){  // cols
            str_array += initial_buff;
            let tmp_array = []
            for (let j= 0 ; j < markers.length; j++){
                let lett = markers[j][i]
                tmp_array.push( lett );
            }
            str_array += tmp_array.join(spacer) + spacer;
            str_array += '\n'
        }
        return str_array;
    }


    static paddID(id, amount = 5){
        return (id + "          ").slice(0,amount)
    }


    exportToHaploFile(){
        var fam = 9999;

        var text = "";
        var spacer = "  ";

        var headers_done = false;

        let padd_amount = 5;
        let preamble_length = (padd_amount * 4) + (7 * spacer.length); // max allowed space for ped data before  header columns kick in
        let preamble_stage = "                                                           ".slice(0,preamble_length);

        let pd = function(sd){
            return TreeGenerator.paddID(sd, padd_amount);
        }

        // Indiv Data
        for (let gen in BenchPerson.generation_map)
        {
            let indivs = BenchPerson.generation_map[gen];
            for (let i in indivs)
            {
                let ind = indivs[i];

                if (!headers_done){
                    // Marker Headers
                    text += this.__transposedHeaders(ind.__temp_haplo_data[0].length, preamble_stage, spacer)
                    text += '\n'
                    headers_done = true;
                }

                let mat = ind.mother === null?0:ind.mother.id,
                    pat = ind.father === null?0:ind.father.id;


                let preamble = [pd(fam), pd(ind.id), pd(pat), pd(mat), ind.gender, ind.affected].join(spacer);

                text += preamble +  spacer + ind.__temp_haplo_data[0].join( spacer ) + '\n'
                text += preamble +  spacer + ind.__temp_haplo_data[1].join( spacer ) + '\n'
            }
        }
        //console.log(text);
        return text;
    }


    /*__insertIntoGlobalMaps(){

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
    }*/
}

