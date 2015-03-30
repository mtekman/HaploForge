
/* How about this:
For each row, I test lookaheads of all indexes on that row.
 1 The index with the greatest stretch is explored first
 2 The next row is the current row plus the greatest stretch
 3 Repeat 1 and 2 until end of array
 4 Jump back to last row

*/
function resolveAmbiguousRegions__DEBUG(array, exclude_list = [], start=0, end=array.length-1)
{
	var min_stretch_len = 1;


	// Define excludelist function
	var inExcludeList;

	if (exclude_list.length === 0){ 						// No list given
		inExcludeList = function (item){ return false;};
	}
	else if (exclude_list.length === 1){ 					// Single item given
		inExcludeList = function (item){ return item === exclude_list;};
	}
	else{ 													// Whole list given
		inExcludeList = function (item){ return (exclude_list.indexOf(item) !== -1);}
	}


	var is_single_indexed_allele = true;

	function indexedRows(){
		var arr = [];
		for (var k=start; k <= end; k++){
			var num_indexes = array[k].color_group.length-1;

			if (num_indexes > 1) is_single_indexed_allele = false;

			arr.push({
				index: num_indexes,
				last_split: 0
			});
		}
		arr.push({index:0, last_split:0}); 							//dummy index, needed for jumping back

		return arr;
	};

	var arrayOfIndexes = indexedRows(), 							// this gets decremented
		origIndexes = indexedRows(); 								// original copy


	// Check if allele is already non-ambig set
	console.log("is_single", is_single_indexed_allele);

	//Return if so
	if (is_single_indexed_allele){
		var unique = array.filter(function(item,i,ar){
			return (item.color_group[0] !== zero_color_grp  && ar.indexOf(item.color_group[0]) === i);
		});

		console.log(unique);

		return [array.map(function (n){return n.color_group[0];}), unique];
	}


	var numset = 0,
		bestset = 99999;

	var	best_path = null,
		temppath = [],
		path_list = [];

	var row = 0,
		num_cycles = 0,
		actual_row = start;

	var current_stretch = min_stretch_len;

// 	console.time("yer");

	//Quick test to see if entire allele is -1


	while (true)
	{
		if (num_cycles ++ > 500) break;

		actual_row = row + start;

		var color_index = arrayOfIndexes[row];
// 		console.log("path="+temppath+", color_index="+color_index.index);

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
			path_list.push( temppath );

			jumpBack = true;
		}

		// All routes for this index have been explored. Go back
		if (color_index.index < 0) jumpBack = true;


		//Jump back to last split
		if (jumpBack){
// 			console.log( ">>jumprow:"+actual_row+"-->"+color_index.last_split+", index to:"+(arrayOfIndexes[color_index.last_split].index - 1)+'\n');

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
// 		console.log("    trying color='"+color+"'");

		if (color === zero_color_grp){
//  			console.log("    zero group, skipping");
			temppath.push(zero_color_grp);
			row ++;
			actual_row ++;

			continue;
		}
		// Exclude it? Try next
		if (inExcludeList(color)){
// 			console.log("   excluding "+color);
			arrayOfIndexes[row].index --;
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
// 			console.log("    failed (too short)", current_stretch+"<"+min_stretch_len);
			while(stretch --> 0) temppath.pop(); 	// clear changes

			arrayOfIndexes[row].index--; 			// next attempt at this row will try a different index
			continue;
		}

		// Successfully found a new color. Splitting
// 		console.log("    worked, arrayOfIndexes["+(actual_row+stretch)+"].last_split = "+actual_row);
		arrayOfIndexes[row+stretch].last_split = row; // this row is where we split


		arrayOfIndexes[row].index--; 		  // somehow this is needed...

		row += stretch;
		numset ++;

		current_stretch = 0;
	}
// 	console.timeEnd("yer");

// 	console.log("holdover", temppath);
// 	console.log("sols", path_list);
// 	console.log("best path=", best_path);
// 	console.log("num cycles=", num_cycles);

	var unique = null;

	if (best_path !== null)
		unique = best_path.filter(function(item,i,ar){
			return (item !== zero_color_grp  && ar.indexOf(item) === i);
		});

	return [best_path, unique];
}
