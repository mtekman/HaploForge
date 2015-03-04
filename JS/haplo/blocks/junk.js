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
