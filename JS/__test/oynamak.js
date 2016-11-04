function longestCommon(alle1, alle2) {
	console.assert(alle1.length === alle2.length, "Arrays must be of equal length");

	var found_sequences = {}; // length: {s_i, f_i} }

	var s_i = 0,
		f_i = 0,
		t_i = 0;

	var sequence_started = false;

	while (t_i < alle1.length) {
		if ( alle1[t_i] === alle2[t_i] ){
			if (!sequence_started) s_i = t_i;

			sequence_started = true;

		} else {
			if (sequence_started){
				f_i = t_i;
				sequence_started = false;

				var rez = {start:s_i, end:f_i};
				found_sequences[f_i - s_i]= rez;
			}
		}
		t_i++;
	}

	if (sequence_started){
		f_i = t_i;
		var rez = {start:s_i, end:f_i};
		found_sequences[f_i - s_i]= rez;
	}

	return found_sequences;
}



function cutting(array, start=0, end=array.length-1)
{
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
		for (var l=0; l < till; l++)
			new_arr.push( array[l] );
		return new_arr;
	};


	var numset = 0,
		bestset = 99999;

	var path_list = [];
	var	best_path = null,
		temppath = [];

	var row = 0,
		actual_row = start,
		min_stretch_len = 2;

	var num_cycles= 0;
//
// 	console.time("yer");
	while (true){
 		if (num_cycles ++ > 90) break;

		actual_row = row + start;

		var color_index = arrayOfIndexes[row];
		console.log("path="+temppath);

		//Test finished
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
			path_list.push ( [temppath, numset] );
			jumpBack = true;
		}

		if (color_index.index < 0)
			jumpBack = true;

		if (jumpBack){
			console.log( ">>jumprow:"+actual_row+"-->"+color_index.last_split+", index to:"+(arrayOfIndexes[color_index.last_split].index - 1)+'\n');

			// jump back to last split
			row = color_index.last_split;
			temppath = cloneTill(temppath, row);

			arrayOfIndexes[row].index--;

			numset --;
			continue;
		}

		//We have an unexplored color
		var color = array[actual_row].color_group[color_index.index];
		console.log("    trying color='"+color+"'");

 		if (color === -1){
 			console.log("    zero group, skipping");
 			temppath.push(-1);
 			row ++;
			actual_row ++;
 			continue;
 		}

		//Perform lookahead
		var stretch = actual_row;

		while ( stretch <= end ){
			var new_colors = array[stretch].color_group;

			if (new_colors[0] === -1){
				temppath.push(-1)
				stretch ++;
			}
			else if (new_colors.indexOf(color)!== -1){
				temppath.push(color);
				stretch ++;
			}
			else break;
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
		arrayOfIndexes[row+stretch].index++; 		  // somehow this is needed...

		row += stretch;
		numset ++;
	}
// 	console.timeEnd("yer");

	console.log("sols", path_list);
	console.log("best path=", best_path);
	console.log("num cycles=", num_cycles);
	return best_path;
}

// var array = [[4,5,6],[4,5],[-1],[3,4,9],[-1],[-1],[8,9],[8,10,11],[8,10,11]]
var array = [
	[-1],
	[-1],
	[-1],
	[-1],
	[-1],
	[-1],
	[-1],
	[-1],
	[-1],
	[-1],
];
var test_array = [];

for (var q=0; q < array.length; q++){
	var arr = [];
	for (var p=0; p < array[q].length; p++){
		arr.push( array[q][p]);
	}
	test_array.push( {color_group: arr} );
}



console.log( cutting(test_array) );


function testIterate(){

	var num_array = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
		num8array = new Int8Array(num_array);

	var num_pop = [],
		num8pop = new Int8Array(20);

	for (var c=0; c<20; c++){
		num_pop.push(c);
		num8pop[c] = c;
	}

	var num16array = new Int16Array(5,16 ,num8array);


	for (var c=0; c < 20; c++){
		console.log("num="+num_array[c]+", num8="+num8array[c]+", pop="+num_pop[c]+", pop8="+num8pop[c]);
		console.log("16 ="+num16array[c]+'\n');
	}
	// It seems that typed arrays functions indiscriminately...
	// Surely the size of index would double up for 8 -> 16 bits?

}
