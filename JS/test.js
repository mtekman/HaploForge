
function debugconsole(condition){
	if (condition)
		for (var a=1; a < arguments.length; a++)
			console.log(arguments[a]);
}

function a_star_bestfirst(array, exclude_list = [])
{
	var end = array.length -1;

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


	function indexedRows(){
		var arr = [];
		for (var k=0; k <= end; k++){
			var num_indexes = array[k].color_group.length;

			if (num_indexes > 1) is_single_indexed_allele = false;

			arr.push({
				index: num_indexes - 1,
				last_split: 0
			});
		}
		arr.push({index:0, last_split:0}); 							//dummy index, needed for jumping back

		return arr;
	};

	var iterableIndexes = indexedRows();

	var MAX_ROUTES = 10;    // maximum amount of working routes

	var	exploring_routes = [[]], 		// initial zero route
		zero_indexes = [];


	var num_cycles = 0;

	while (true)
	{
		//Sort current open routes, and take the top batch
		// discarding the rest
		exploring_routes = exploring_routes.sort(function (a,b){ return b.length - a.length;}).slice(0,MAX_ROUTES);

		console.log(exploring_routes);

		if (num_cycles ++ > 100){
			console.error(num_cycles);
			break;
		}


		for (var e=0; e < exploring_routes.length; e++)
		{
			// Current open route
			var current_route = exploring_routes[e],
				current_row = current_route.length;

// 			if (current_row === end){
// 				continue;
// 			}

			// Various routes at this row
			var num_colors = iterableIndexes[current_row].index;

			console.log(num_colors);

			var ordered_routes = {};

			// Look ahead by one
			for (var c=0; c< num_colors; c++){
				var current_color = array[current_row].color_group[c];

				//Perform look ahead
				var stretch = current_row;
				while ( stretch <= end)
				{
					var new_colors = array[stretch].color_group;

					if (new_colors.indexOf(current_color) === -1)
						break;
					else
						stretch ++;

					// Mark (but still count) zeros
					if (new_colors.length === 1 && new_colors[0] === zero_color_grp)
						zero_indexes.push( stretch );
				}
				ordered_routes[stretch-current_row] = current_color; // store color
			}

			var keys_rev_ord = Object.keys(ordered_routes).sort(function(a,b){return b-a});

			// Add routes to current route
			for (var k=0; k < keys_rev_ord; k++){

				var new_r = current_route.slice(); 	//clone a new path for each fork

				var len = k;
				while(len --> 0)
					new_r.push(  ordered_routes[k] ); 	// push the color k times

				//Add the zeros
				for (var z=0; z < zero_indexes.length; z++)
					arrayOfIndices

				exploring_routes.push(new_r); 			// push the new path
			}
		}
	}
	console.log("best_routes A*", exploring_routes);

	return [exploring_routes[0],[]];
}




/* How about this:
For each row, I test lookaheads of all indexes on that row.
 1 The index with the greatest stretch is explored first
 2 The next row is the current row plus the greatest stretch
 3 Repeat 1 and 2 until end of array
 4 Jump back to last row

*/
function resolveAmbiguousRegions__DEBUG(array, exclude_list = [], debug=false)
{

	if (debug)
		return a_star_bestfirst(array);


	var start =0,
		end = array.length - 1;

	var min_stretch_len = 10;


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
			var num_indexes = array[k].color_group.length;

			if (num_indexes > 1) is_single_indexed_allele = false;

			arr.push({
				index: num_indexes - 1,
				last_split: 0
			});
		}
		arr.push({index:0, last_split:0}); 							//dummy index, needed for jumping back

		return arr;
	};

	var arrayOfIndexes = indexedRows(), 							// this gets decremented
		origIndexes = indexedRows(); 								// original copy


	// Check if allele is already non-ambig set
	if (debug) console.log("is_single", is_single_indexed_allele);

	//Return if so
	if (is_single_indexed_allele){
		var unique = array.filter(function(item,i,ar){
			return (item.color_group[0] !== zero_color_grp  && ar.indexOf(item.color_group[0]) === i);
		});

		if (debug)  console.log(unique);

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

	var debug_path = [];


	while (true)
	{
		if (num_cycles ++ > 50){
			console.error("num_cycles="+num_cycles);
			break;
		}

		actual_row = row + start;

		var color_index = arrayOfIndexes[row];
		if (debug) console.log("path="+debug_path+", color_index="+color_index.index);

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
			if (debug) console.log( ">>jumprow:"+actual_row+"-->"+color_index.last_split+", index to:"+(arrayOfIndexes[color_index.last_split].index - 1)+'\n');

			// Restore this index
			arrayOfIndexes[row].index = origIndexes[row].index;

			// Row to jump back to
			row = color_index.last_split;
			temppath = cloneTill(temppath, row);

			numset --;

			debug_path.pop();

			continue;
		}
		//We have an unexplored color
		var color = array[actual_row].color_group[color_index.index];
		if (debug) console.log("    trying color='"+color+"' @ "+actual_row);

		debug_path.push( color );


		if (color === zero_color_grp){
//  			console.log("    zero group, skipping");
			temppath.push(zero_color_grp);
			row ++;
			actual_row ++;

			continue;
		}
		// Exclude it? Try next
		if (inExcludeList(color)){
			if (debug) console.log("   excluding "+color);
			arrayOfIndexes[row].index --;
			continue;
		}


		//Perform lookahead on all current indices and select the most likely
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
		if (current_stretch < min_stretch_len
		   && origIndexes[row].index > 1){
			if (debug) console.log("    failed (too short)", current_stretch+"<"+min_stretch_len);
			while(stretch --> 0) temppath.pop(); 	// clear changes

			arrayOfIndexes[row].index--; 			// next attempt at this row will try a different index
			continue;
		}

		// Successfully found a new color. Splitting
		if (debug) console.log("    worked, arrayOfIndexes["+(actual_row+stretch)+"].last_split = "+actual_row);
		arrayOfIndexes[row+stretch].last_split = row; // this row is where we split


		arrayOfIndexes[row].index--; 		  // somehow this is needed...

		row += stretch;
		numset ++;

		current_stretch = 0;
	}
	if (debug) console.timeEnd("yer");

	if (debug) console.log("holdover", temppath);
	if (debug) console.log("sols", path_list);
	if (debug) console.log("best path=", best_path);
	if (debug) console.log("num cycles=", num_cycles);

	var unique = null;

	if (best_path !== null)
		unique = best_path.filter(function(item,i,ar){
			return (item !== zero_color_grp  && ar.indexOf(item) === i);
		});

	return [best_path, unique];
}
