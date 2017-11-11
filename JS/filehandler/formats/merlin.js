
var debugMerlin = {};

class Merlin extends FileFormat {

	constructor(mode_init = null)
	{
		var haplo = {
			id: "merlin_haplo",
			process: function(haplo_text){
				debugMerlin.haplo = haplo_text;
				Merlin.populateFamilyAndHaploMap(haplo_text, true);
			},
			hasMarkerNames : false,
			inferGenders : true,
			observedGTs: true
		}

		var descent = {
			id: "merlin_descent",
			process: function(descent_text){
				debugMerlin.descent = descent_text;
				Merlin.populateFlow(descent_text);
			},
			resolver_mode: AssignHGroups.resolvers.FLOW
		}

		var map = {
			id: "merlin_map",
			process : Merlin.populateMarkerMap
		}

		var pedin = {
			id: "merlin_ped",
			process : FileFormat.updateFamily
		}

		super(haplo, map, pedin, descent, mode_init);
	}

	static populateFlow(text_unformatted, mapped_gts){
		Merlin.populateFamilyAndHaploMap(text_unformatted, mapped_gts, true);
	}


	static populateFamilyAndHaploMap(text_unformatted, mapped_gts = true, flow = false){
		//console.log("::"+(flow?"Flow":"Chr")+" --- start");
		var lines = text_unformatted.split('\n');

		var tmp = {
			_fam : null,
			_perc_array : [], // horizontal percs
			_alleles_array : [] // vertical haplos [ [[],[]] , [[],[]] ]
		}

		function flushTmpData(tmp){
			// Finish populating alleles and insert percs
			if (tmp._perc_array.length > 0)
			{
				if (tmp._perc_array.length !== tmp._alleles_array.length){
					error("Length mismatch");
				}

				for (var tpa=0; tpa < tmp._perc_array.length; tpa ++)
				{
					var perc_alleles = tmp._alleles_array[tpa],
						perc = tmp._perc_array[tpa];

					if (flow){ // flow relies on prior perc existence
						var perc = familyMapOps.getPerc(perc.id, tmp._fam);
						perc.insertFlowData( perc_alleles[0] );
						perc.insertFlowData( perc_alleles[1] );
						//console.log("INSERTING FLOW", perc.id, perc.haplo_data[0].flow);
					}
					else {
						perc.insertHaploData( perc_alleles[0] )
						perc.insertHaploData( perc_alleles[1] )
						familyMapOps.insertPerc(perc, Number(tmp._fam));
					}
				}

				tmp._perc_array = [];
				tmp._alleles_array = [];
			}
		}




		// Populate Marker
		for (var l=0; l < lines.length; l++)
		{
			var line = lines[l];

			if (line.startsWith("FAMILY")){

				flushTmpData(tmp);

				var fid = line.split(/\s+/)[1]
				tmp._fam = Number(fid);
				continue
			}


			if (tmp._perc_array.length === 0){
				// Hunt for names
				if (line.indexOf('(')!==-1 && line.indexOf(')')!==-1)
				{
					var people = line.trim().split(/\s{2,}/);

					for (var p=0; p < people.length; p++)
					{
						var perc = people[p].split(" ");

						var id = Number(perc[0]),
							parents = perc[1].split("(")[1].split(")")[0];

						var mother_id = 0,
							father_id = 0;

						if (parents !== "F"){
							parents = parents.split(",").map(x => Number(x));

							mother_id = parents[0];
							father_id = parents[1];
						}

						// Gender's and Affecteds are unknown.
						// Gender's can be inferred, but affectation needs a ped file
						var newp = new Person(id, 0, 0, mother_id, father_id);
						tmp._perc_array.push(newp);
						tmp._alleles_array.push([ [],[] ])
					}
				}
				continue;
			}

			var trimmed = line.trim();
			if (trimmed.length == 0){
				flushTmpData(tmp);
				continue;
			}

			//Allele lines
			var multiple_alleles = trimmed.split(/\s{3,}/);

			if (multiple_alleles.length  !== tmp._perc_array.length){
				console.log(trimmed, multiple_alleles, tmp._perc_array)
				error("Num alleles and num percs do not align");
			}

			for (var a=0; a < multiple_alleles.length; a++)
			{
				var alleles = multiple_alleles[a],
					left_right = null;

				if (!flow){
					// We ignore all types of phasing and for
					// ambiguously marker alleles "A", we pick the
					// first (this holds consistent for inherited).
					//var left_right = alleles.split(/\s[+:|\\/]\s/)

					left_right = alleles.split(/\s[^\d]\s/).map(x=> {
							var chosen = x.split(",")[0].trim() // first potential allele is taken and assumed outright
							if (chosen.length === 2){
								chosen = chosen.replace("A","")
							}
							return chosen
						}
					);

					if (mapped_gts){
						left_right = left_right.map(
							x => ObservedBases.recodeBase(x)
						)
					}
					else {
						left_right = left_right.map(x=> Number(x))
					}
				}
				else {
					left_right = alleles.split(/\s[^\d]\s/);
					FlowResolver.convertGroupsToFamilySpecific(left_right, tmp._fam);
				}

				tmp._alleles_array[a][0].push(left_right[0]);
				tmp._alleles_array[a][1].push(left_right[1]);
			}
		}
		flushTmpData(tmp);

		//console.log("::"+(flow?"Flow":"Chr")+" --- finish");
	}

	static populateMarkerMap(text_unformatted){
		//console.log("::Map --- start");

		debugMerlin.map = text_unformatted;

		var lines = text_unformatted.split('\n');

		var markers = [],
			genepos = [];

		for (var l=1; l < lines.length; l++){ //skip headers

			var line = lines[l].trim()

			if (line === ""){
				continue;
			}

			var chr_genpos_marker = line.split(/\s+/);

//			console.log(chr_genpos_marker, chr_genpos_marker.length, line);
			markers.push( chr_genpos_marker[2].trim()  )
			genepos.push( Number(chr_genpos_marker[1]) );
		}

		MarkerData.addMarkers( markers );
		MarkerData.addGenePos( genepos );

		//console.log("::Map --- finish");
	}
}
