
/* Runs after AssignHgroups !

 - Expands around ambiguous HTs to find the nearest encapsulating haploblock.

 - If an ambiguous region is continuous, it searches for the *least* ambiguous incices
   within the region and assigns a common color group (where possible) to these indices
   which act as the new borders to expand from.

 - Recursion may be required, though not wanted :(

*/
function removeAmbiguousPointers(fam)
{
	var MIN_HAP_STRETCH = 2;

	for (var g = 0; g < generation_grid_ids[fam].length; g++){
		for (var p =0; p < generation_grid_ids[fam][g].length; p++)
		{
			var id = generation_grid_ids[fam][g][p];
			var both_alleles = family_map[fam][id].haplo_data;

			for (var a = 0; a < both_alleles.length; a++)
			{

				var ambig_indices_singles = [],
					ambig_indices_regions = [],
					pointer_array = both_alleles[a].pter_array;

				var curr_index = 0;

				// 1. Find ambiguous indices
				var last_ambig = -100,
					temp_group = [0,0],
					temp_started_group = false;


				while (curr_index < pointer_array.length - 1){

					if (pointer_array[curr_index].color_group === undefined){
						console.log("id="+id+", a="+a+", index="+curr_index);
					}


					if (pointer_array[curr_index].color_group.length > 1){

						if (curr_index === last_ambig + 1){ 			// identified the start of a continuous region
							if (!(temp_started_group))
							{
								temp_started_group = true;  // new region, starting from previous
								temp_group[0] = last_ambig; // store previous

							}
						}
						else{ 											// identified discontinuity
							if (temp_started_group){
								temp_group[1] = curr_index-1; 			// store previous
								temp_started_group = false;

// 								console.log("group", temp_group);

								ambig_indices_regions.push( temp_group );
								temp_group = [0,0]; 			// reset
							}
							ambig_indices_singles.push( curr_index );
						}
						last_ambig = curr_index;
					}
					curr_index ++;

// 					else{ // Non-ambiguous, remove array and assign to first_elem
// 						if (pointer_array[curr_index].color_group === undefined){
// 							console.log("undefined =", id, "@", both_alleles[a].data_array[curr_index]);
// 						}
// 						pointer_array[curr_index].color_group = pointer_array[curr_index].color_group[0];

// 					}
				}
				if (temp_started_group){
// 					console.log("HERE", curr_index);
					temp_group[1] = curr_index;
					ambig_indices_regions.push( temp_group);
				};




				// 2. Find surrounding blocks for each ambiguous index,
 				//    if blocks aren't the same, measure their lengths and go for longest (or pick random?)

				// Process singles
				curr_index = 0;

				while (curr_index++ < ambig_indices_singles.length -1){
					var ambig_index = ambig_indices_singles[curr_index];

					var back_index = ambig_index,
						forw_index = ambig_index;


					// Is this neccesary? Surely back 1 and forward 1 should be enough?
					while (pointer_array[forw_index++].color_group.length > 1
						  && forw_index < pointer_array.length){} 	//Search ahead for next unambiguous pointer
					forw_index --; 									// <--- needed.

					while (pointer_array[back_index--].color_grouplength > 1
						  && back_index >= 0){} 					//Search back also;

// 					if (forw_index > 1700){
// 						console.log("single",back_index, forw_index, "target:", ambig_index);

// 						for (var f = back_index; f <= forw_index; f++)
// 							console.log("  "+f+":", pointer_array[f].color_group);

// 					}

					//Compare colors
					var color_back = pointer_array[back_index].color_group[0],
						color_forw = pointer_array[forw_index].color_group[0];

					//Outcomes:

					// a. colors match - yay
					if (color_back === color_forw){
						pointer_array[ambig_index].color_group = color_back;
						break;
					}

					// b. colors do not match, get block lengths pick largest
					// Just pick random for now
					pointer_array[ambig_index].color_group = color_forw;
				}

				// Process regions
				curr_index = 0;

				while (curr_index++ < ambig_indices_regions.length - 1)
				{
					var lower_index = ambig_indices_regions[curr_index][0],
						upper_index = ambig_indices_regions[curr_index][1];

// 					if (upper_index > 1700)
					console.log("region",lower_index, upper_index);

					var iter = lower_index,
						working_path = [];

					while (iter <= upper_index)
					{
						for (var k=0; k < pointer_array[iter].color_group.length; k++)
						{
							var current_group = pointer_array[iter].color_group[k],
								next_group;

//							console.log(current_group);

							//Look ahead
							var cind = iter;

							do {
								next_group = pointer_array[cind++].color_group;
// 								console.log(next_group);
							}
							while (next_group.indexOf(current_group)!==-1 && cind <= upper_index);

							// Found a new number at this stage

							var length_of_stretch = cind - iter;

							if (length_of_stretch >= MIN_HAP_STRETCH)
							{
								//Yes, add old number to working path;
								for (var l=0; l < length_of_stretch;
									 l++ && working_path.push( current_group ) );

								// Change iter to move forwards:
								iter += length_of_stretch;
								break;

								//After break, iter moves forwards and gets a new num
							}
							// Otherwise we don't advance.
							// Try next number in group
							// k advances
						}
						// We skip this marker and try the search again
// 						iter ++;

						//Here assign the solution to the pointer_array
						console.log(working_path);

						if (working_path.length != 0){
							for (var t=lower_index; t <= upper_index; t++)
								pointer_array[t].color_group = working_path[t - lower_index];
						}
					}
				}
			}
		}
	}
}


/*
Copies the pter_array from each allele from each individual after haplogroups become completely unambiguous
and populates haplogroup_array

*/
function copyPointersAndClean(fam){

	for (var g = 0; g < generation_grid_ids[fam].length; g++){
		for (var p =0; p < generation_grid_ids[fam][g].length; p++)
		{
			var id = generation_grid_ids[fam][g][p];
			var both_alleles = family_map[fam][id].haplo_data;

			for (var a = 0; a < both_alleles.length; a++)
			{
				var pointer_array = both_alleles[a].pter_array;

				both_alleles[a].haplogroup_array = new Int8Array(pointer_array.length);

// 				try {
					for (var b=0; b < pointer_array.length; b++){
		//				if (pointer_array[b].color_group === undefined)
        //    				console.log("  "+id+" @ "+b);
// 						both_alleles[a].haplogroup_array[b] = pointer_array[b].color_group[0];
					}
// 					delete both_alleles[a].pter_array;
//
// 				} catch (e) {
// 					console.log("b="+b, pointer_array[b]);
// 				}
			}

			console.log("cleaned "+id, both_alleles);
		}
	}
}
