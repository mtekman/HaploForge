var max_distance_before_split = 50; // 50bp for non-continuous segments before a new block is defined.


var cloneTill = function(array, till){
	var new_arr = [];
	for (var l=0; l < till; l++)
		new_arr.push( array[l] );
	return new_arr;
};


// Haploblocks from different founders are not
// of the same size, and indeed could be 1 marker long
//
// For over 200 markers, I assume the resolution is good
// enough that no block is less than 2 markers long

function resolveAmbiguousRegions(array, start=0, end=array.length-1)
{
	var min_stretch_len = 1;

	function indexedRows(){
		var arr = [];
		for (var k=start; k <= end; k++){
			arr.push({
				index: array[k].color_group.length-1,
				last_split: 0
			});
		}
		arr.push({index:0, last_split:0}); 							//dummy index, needed for jumping back

		return arr;
	};
	var arrayOfIndexes = indexedRows(), 							// this gets decremented
		origIndexes = indexedRows(); 								// original copy

	var numset = 0,
		bestset = 99999;

	var	best_path = null,
		temppath = [];

	var row = 0,
		actual_row = start;

	var current_stretch = min_stretch_len;

	while (true)
	{
		actual_row = row + start;

		var color_index = arrayOfIndexes[row];

		if (row === 0){
			if (color_index.index < 0) break; 					//No more paths to explore after jumping back.
			numset = 0;
		}

		var jumpBack = false;

		if (row === arrayOfIndexes.length-1)
		{
			if (numset < bestset){
				bestset = numset;
				best_path = temppath;
			}
			jumpBack = true;
		}

		// All routes for this index have been explored. Go back
		if (color_index.index < 0) jumpBack = true;


		//Jump back to last split
		if (jumpBack){
			// Restore this index
			arrayOfIndexes[row].index = origIndexes[row].index;

			// Row to jump back to
			row = color_index.last_split;
			temppath = cloneTill(temppath, row);

			numset --;

			continue;
		}
		//We have an unexplored color
		var color = array[actual_row].color_group[color_index.index];

		if (color === zero_color_grp){
			temppath.push(zero_color_grp);
			row ++;
			actual_row ++;
			continue;
		}

		//Perform lookahead
		var stretch = actual_row;
		while ( stretch <= end )
		{
			var new_colors = array[stretch].color_group;

			if (new_colors[0] === zero_color_grp){
				temppath.push(zero_color_grp)
				stretch ++;
				current_stretch ++;
			}
			else if (new_colors.indexOf(color)!== -1){
				temppath.push(color);
				stretch ++;
				current_stretch ++;
			}
			else break;

		}
 		stretch -= actual_row;

		// Unsuccessful
		if (current_stretch < min_stretch_len){
			while(stretch --> 0) temppath.pop(); 	// clear changes

			arrayOfIndexes[row].index--; 			// next attempt at this row will try a different index
			continue;
		}

		// Successfully found a new color. Splitting
		arrayOfIndexes[row+stretch].last_split = row; // this row is where we split

		arrayOfIndexes[row].index--;

		row += stretch;
		numset ++;

		current_stretch = 0;
	}
	return best_path;
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
	for (var g = 0; g < generation_grid_ids[fam].length; g++)
	{
		for (var p =0; p < generation_grid_ids[fam][g].length; p++)
		{
			var id = generation_grid_ids[fam][g][p];
			var both_alleles = family_map[fam][id].haplo_data;

			for (var a = 0; a < both_alleles.length; a++)
			{
				//Clean pointers
				var pointer_array =  both_alleles[a].pter_array;
				var group_array = (both_alleles[a].haplogroup_array = new Int8Array(pointer_array.length));

				// 64-bit iterator, yet implicit 64 --> 8 bit conv: How? Fuck knows.

				var curr_index = -1;
				while (++curr_index < pointer_array.length)
					group_array[curr_index] = pointer_array[curr_index].color_group[0];

				// Leave for GC
 				delete both_alleles[a].pter_array;
			}
		}
	}
}
