function longestCommon(alle1, alle2) {
	assert(alle1.length === alle2.length, "Arrays must be of equal length");

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

testIterate();
