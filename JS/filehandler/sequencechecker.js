import familyMapOps from '/JS/pedigree/familymapops.js';

var SequenceChecker = {

    hasSequence : false, // set by file upload checkbox
    use : false, // set by "Togg. Seq", read by each respective fileformat subclass

    _marker_map : [], // 10 → {"T":0, "G":0}
    _marker_ab : [], // 10 → {"T": 1, "G": 2}

    recodeAll(){
        SequenceChecker._cloneHaploAndEnumerateMarkerStates();
    },

    _cloneHaploAndEnumerateMarkerStates(){

        familyMapOps.foreachperc(function(pid, fid, perc){
            let allele1data = perc.haplo_data[0].data_array,
                allele2data = perc.haplo_data[1].data_array

            // Clone + Recode -- has to be done in a for loop due Int8 -> Char
            var olo1 = []
            var olo2 = []
            for (var i=0; i < allele1data.length; i++){
                olo1.push(ObservedBases.decodeBase(allele1data[i]))
                olo2.push(ObservedBases.decodeBase(allele2data[i]))
            }

            perc.haplo_data[0].sequence = olo1
            perc.haplo_data[1].sequence = olo2

            // Iterate over all marker states
            for (let m=0; m < MarkerData.rs_array.length; m++){
                let all1 = allele1data[m],
                    all2 = allele2data[m];

                if (!(m in SequenceChecker._marker_map)){
                    SequenceChecker._marker_map[m] = new Map()
                }
                SequenceChecker._marker_map[m][all1] = true
                SequenceChecker._marker_map[m][all2] = true
            }
        });

        // Check biallelic and remap to AB
        for (let m=0; m < MarkerData.rs_array.length; m++)
        {
            var base_array = [];
            for (let base in SequenceChecker._marker_map[m]){
                if (base != ObservedBases._nullbase){
                    base_array.push(base)
                }
            }

            switch(base_array.length){
                case 1:
                    // monoallelic, clone first base
                    base_array.push(base_array[0]);
                    break;
                case 2:
                    break;
                default:
                    console.log("FR", base_array);
                    error("Marker " + m + " not bialleic" );
                break;
            }

            // translate [A,T] → {1,2}
            //console.log(base_array, base_array.map(x => ObservedBases.decodeBase(x)))
            SequenceChecker._marker_ab[m] = new Map()
            SequenceChecker._marker_ab[m][base_array[0]] = 1
            SequenceChecker._marker_ab[m][base_array[1]] = 2
        }

        // Recode alleles
        familyMapOps.foreachperc(function(pid, fid, perc)
        {
            let allele1data = perc.haplo_data[0].data_array,
            allele2data = perc.haplo_data[1].data_array

            for (let m=0; m < MarkerData.rs_array.length; m++)
            {
                let all1 = perc.haplo_data[0].data_array[m],
                    all2 = perc.haplo_data[1].data_array[m];

                let onetwo1 = SequenceChecker._marker_ab[m][all1],
                    onetwo2 = SequenceChecker._marker_ab[m][all2];

                // assign
                perc.haplo_data[0].data_array[m] = onetwo1;
                perc.haplo_data[1].data_array[m] = onetwo2;
            }
        });
    }
}
