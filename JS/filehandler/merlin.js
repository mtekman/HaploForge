
class Merlin extends FileFormat {

	constructor(mode_init = null)
	{
		var haplo = {
			id: "merlin_haplo",
			process: function(haplo_text){
				Merlin.populateFamilyAndHaploMap(haplo_text);
			},
			hasMarkerNames : false,
			inferGenders : true
		}

		super(haplo, null, null, null, mode_init);
	}


	static populateFamilyAndHaploMap(text_unformatted){
		var lines = text_unformatted.split('\n');

		var tmp_fam = null,
			tmp_perc_array = [], // horizontal percs
			tmp_alleles_array = []; // vertical haplos [ [[],[]] , [[],[]] ]



		function flushTmpData(){
			// Finish populating alleles and insert percs
			if (tmp_perc_array.length > 0)
			{
				if (tmp_perc_array.length !== tmp_alleles_array.length){
					console.log("Length mismatch");
					throw new Error("");
				}


				for (var tpa=0; tpa < tmp_perc_array.length; tpa ++)
				{
					var perc_alleles = tmp_alleles_array[tpa],
						perc = tmp_perc_array[tpa];

					perc.insertHaploData( perc_alleles[0] )
					perc.insertHaploData( perc_alleles[1] )
					familyMapOps.insertPerc(perc, tmp_fam);
				}

				tmp_perc_array = [];
				tmp_alleles_array = [];
			}
		}




		// Populate Marker
		for (var l=0; l < lines.length; l++)
		{
			var line = lines[l];

			if (line.startsWith("FAMILY")){

				flushTmpData();

				var fid = line.split(/\s+/)[1]
				tmp_fam = fid;
				continue
			}


			if (tmp_perc_array.length === 0){
				// Hunt for names
				if (line.indexOf('(')!==-1 && line.indexOf(')')!==-1)
				{
					var people = line.trim().split(/\s{2,}/);

					for (var p=0; p < people.length; p++)
					{
						var perc = people[p].split(" ");

						var id = parseInt(perc[0]),
							parents = perc[1].split("(")[1].split(")")[0];

						var mother_id = 0,
							father_id = 0;

						if (parents !== "F"){
							parents = parents.split(",").map(x => parseInt(x));
							
							mother_id = parents[0];
							father_id = parents[1];
						}

						// Gender's and Affecteds are unknown.
						// Gender's can be inferred, but affectation needs a ped file
						var newp = new Person(id, 0, 0, mother_id, father_id);
						tmp_perc_array.push(newp);
						tmp_alleles_array.push([ [],[] ])
					}
				}
				continue;
			}

			var trimmed = line.trim();
			if (trimmed.length == 0){
				flushTmpData();
				continue;
			}

			//Allele lines
			var multiple_alleles = trimmed.split(/\s{3,}/);

			if (multiple_alleles.length  !== tmp_perc_array.length){
				console.log(trimmed, multiple_alleles, tmp_perc_array)
				throw new Error("Num alleles and num percs do not align");
			}
			
			for (var a=0; a < multiple_alleles.length; a++)
			{
				var alleles = multiple_alleles[a];

				// We ignore all types of phasing and for 
				// ambiguously marker alleles "A", we pick the
				// first (this holds consistent for inherited).
				var left_right = alleles.split(/\s[:|\/]\s/)
										.map(x=> parseInt(x
											.split(",")[0]
											.replace("A","")
											.replace("?","0"))
										);

				tmp_alleles_array[a][0].push(left_right[0]);
				tmp_alleles_array[a][1].push(left_right[1]);
			}
		}

		flushTmpData();
	}


	static populateMarkerMap(text_unformatted){}

	

}