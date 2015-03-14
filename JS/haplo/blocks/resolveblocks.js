var max_distance_before_split = 50; // 50bp for non-continuous segments before a new block is defined.
var min_stretch_len = 2;


function resolveAmbiguousRegions(array, start=0, end=array.length-1)
{
// 	console.log(array);

	var arrayOfIndexes = (function (){
		var arr = [];
		for (var k=start; k <= end; k++){
			arr.push({
				index: array[k].color_group.length-1,
				last_split: 0
			})
		}
		arr.push({index:0, last_split:0}); 							//dummy index, needed for jumping back

		return arr;
	})();


	var cloneTill = function(array, till){
		var new_arr = [];
		for (var l=0; l < till; l++)new_arr.push( array[l] );
		return new_arr;
	};


	var numset = 0, bestset = 99999;

// 	var path_list = [];
	var	best_path = null, temppath = [];

	var row = 0, actual_row = start;

// 	var num_cycles= 0;
// 	console.time("yer");

	while (true){
// 		num_cycles ++;
		actual_row = row + start;

		var color_index = arrayOfIndexes[row];
		console.log("path="+temppath);

		var jumpBack = false;

		if (row === 0){
			if (color_index.index < 0) break; 					//No more paths to explore after jumping back.
			numset = 0;
		}

		if (row === arrayOfIndexes.length-1)
		{
			if (numset < bestset){
				bestset = numset;
				best_path = temppath;
			}
// 			path_list.push ( temppath );
			jumpBack = true;
		}

		if (color_index.index < 0) jumpBack = true;

		if (jumpBack){
			console.log( ">>jumprow:"+actual_row+"-->"+color_index.last_split+", index to:"+(arrayOfIndexes[color_index.last_split].index - 1)+'\n');

			// jump back to last split
			row = color_index.last_split;
			temppath = cloneTill(temppath, row);

			arrayOfIndexes[row].index--;
			continue;
		}

		//We have an unexplored color
		var color = array[actual_row].color_group[color_index.index];
		console.log("    trying color='"+color+"'");

		//Perform lookahead
		var stretch = actual_row;
		while ( stretch <= end && array[stretch].color_group.indexOf(color)!== -1){
			temppath.push(color);
			stretch ++;
		}
		stretch -= actual_row;

		// Unsuccessful
		if (stretch < min_stretch_len){
			console.log("    failed (too short)");
			while(stretch --> 0) temppath.pop(); 	// clear changes

			arrayOfIndexes[row].index--; 			// next attempt at this row will try a different index
			continue;
		}
		// Successfully found a new color. Splitting
		console.log("    worked, arrayOfIndexes["+(actual_row+stretch)+"].last_split = "+actual_row);
		arrayOfIndexes[row+stretch].last_split = row; // this row is where we split

		row += stretch;
		numset ++;
	}
// 	console.timeEnd("yer");

// 	console.log("sols", path_list);
// 	console.log("best path=", best_path);
// 	console.log("num cycles=", num_cycles);
	return best_path;
}




function findRoughBlocks(pointer_array){

	var index = 0,
		blocks = [];  // blocks: { group:num, start:index, end:index}

	var started_block = false,
		last_color = -2,
		last_cont_index = -1,
		temp_block = {};



	do {
		var color_array = pointer_array[index].color_group;


		if (color_array.length === 1){

			var color = color_array[0];

			// Detected a change in block (or forced)
			if (color === zero_color_grp){
				index ++;
				continue;
			}

			if (color !== last_color || ((index - last_cont_index) > max_distance_before_split)){

				if (started_block){
					temp_block.end = last_cont_index;
					blocks.push( temp_block );

					temp_block = {};
					started_block = false;
				}

				if (!(started_block)){
					started_block = true;
					temp_block = {group:color, beg:index, end:-1};
				}
			}

			last_cont_index = index;
			last_color = color;
		}
	}
	while(index++ < pointer_array.length-1);


	if (started_block){
		temp_block.end = last_cont_index;
		blocks.push( temp_block );

		temp_block = {};
		started_block = false;
	}

	console.log(pointer_array.map( function(n){ return n.color_group;}) );
}


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

				var curr_index = -1;

				// 1. Find ambiguous indices
				var last_ambig = -100,
					temp_group = [0,0],
					temp_started_group = false;


				// We can get a good understanding of what the allele should look like if we just examine the singles
				// and estimate block boundaries

				if (id === 9 && a === 0){
					console.log(id, a);
					console.group()
					var sib = resolveAmbiguousRegions(pointer_array);
					console.log(sib);
					console.groupEnd();
				}
				continue;
// 				throw new Error("stop");

				while (++curr_index < pointer_array.length)
				{

					if (curr_index < 420)
						if (pointer_array[curr_index].color_group.length === 1)
							console.log(curr_index, pointer_array[curr_index].color_group);



					if (pointer_array[curr_index].color_group.length > 1){

						if (curr_index === last_ambig + 1){ 						// identified the start of a continuous region
							if (!(temp_started_group))
							{
								temp_started_group = true;  						// new region, starting from previous
								temp_group[0] = last_ambig-1; 						// store previous

							}
						}
						else{ 														// identified discontinuity
							if (temp_started_group){
								temp_group[1] = curr_index-1; 						// store previous
								temp_started_group = false;

								if (temp_group[1] - temp_group[0] <= 2)
									ambig_indices_singles.push( temp_group[1] -1 );
								else
									ambig_indices_regions.push( temp_group );

								temp_group = [0,0]; 								// reset
							}
							else{
								temp_started_group = true;
								temp_group[0] = curr_index - 1;
							}
						}
						last_ambig = curr_index;
					}

					//else unambiguous
				}
				if (temp_started_group){
					temp_group[1] = curr_index-1; 			// store previous
					temp_started_group = false;

					if (temp_group[1] - temp_group[0] === 2)
						ambig_indices_singles.push( temp_group[1] -1 );
					else
						ambig_indices_regions.push( temp_group );
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
						console.log("single",back_index, forw_index, "target:", ambig_index);

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

//  					if (upper_index < 300){
// 						console.log("region",lower_index, upper_index);
// 						for (var f =lower_index-1; f < upper_index+1; f++)
// 							console.log("  "+f,pointer_array[f].color_group);
// 					}

					iter ++;
					continue;


					var iter = lower_index,
						working_path = [];

					while (iter <= upper_index)
					{
						for (var k=0; k < pointer_array[iter].color_group.length; k++)
						{
							var current_group = pointer_array[iter].color_group[k],
								next_group;

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
 						iter ++;

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

				//both_alleles[a].haplogroup_array = new Int8Array(pointer_array.length);

				for (var b=0; b < pointer_array.length; b++){
// 					if (pointer_array[b].color_group.length > 1)
//            				console.log("  "+id+" @ "+b, pointer_array[b].color_group, both_alleles[a].data_array[b]);
// 						both_alleles[a].haplogroup_array[b] = pointer_array[b].color_group[0];
				}
// 					delete both_alleles[a].pter_array;
//
// 				} catch (e) {
// 					console.log("b="+b, pointer_array[b]);
// 				}
			}

//			console.log("cleaned "+id, both_alleles);
		}
	}
}
