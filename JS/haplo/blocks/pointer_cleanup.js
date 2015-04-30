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
