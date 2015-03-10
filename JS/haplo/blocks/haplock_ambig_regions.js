
// Looking ahead
var data = [
	[4,5,6  ],
	[4,5    ],
	[3,4,9  ],
	[8,9    ],
	[8,10,11],
	[8,10,11]
];

// Aim is to minimize sets.
// Ideal outcome would be 4,4,4,8,8,8

var iter = index,
	working_path = [];

while (iter < data.length){

	for (var g = 0; g < data[iter].length; g++)
	{
		var current_group = groups[g],
			next_group;

		//Look ahead
		var cind = iter;

		do {
			next_group = data[cind++];
		}
		while(next_group.indexOf(current_group)!==-1);

		//Found new number

		//Check length of stretch
		var len_stretch = iter - cind;
		if (len_stretch >= MIN_HAP_STRETCH)
		{
			// Keep going with new number
			//
			//  Add old number to the working_path len_stretch times
			//  pick a new number from the next_group to replace iter
			//
			for (var n=0; n < len_stretch; n++)
				working_path.push( current_group );

			iter += len_stretch;

			break;
			// After break, iter has moved forwards and picks a new number
		}
		// Otherwise we don't advance and try next number in group
		// in the next iteration.
	}
}

