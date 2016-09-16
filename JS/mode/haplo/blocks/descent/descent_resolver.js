
var DescentResolver = {

	child2parent_link: function(child, mother, father, fam){

		var pers_hp = pers.haplo_data,
			moth_hp = moth.haplo_data,
			fath_hp = fath.haplo_data;


		// We assume paternal is 1st, and maternal is 2nd allele
		var m1_gts = moth_hp[0].data_array,
			m2_gts = moth_hp[1].data_array,
			f1_gts = fath_hp[0].data_array,
			f2_gts = fath_hp[1].data_array,
			c1_gts = pers_hp[0].data_array,
			c2_gts = pers_hp[1].data_array;

		var m1_des = moth_hp[0].descent,
			m2_des = moth_hp[1].descent,
			f1_des = fath_hp[0].descent,
			f2_des = fath_hp[1].descent,
			c1_des = pers_hp[0].descent,
			c2_des = pers_hp[1].descent;

		var m1_cls = moth_hp[0].color_group,
			m2_cls = moth_hp[1].color_group,
			f1_cls = fath_hp[0].color_group,
			f2_cls = fath_hp[1].color_group;


		// To be assigned
		var c1_cls = pers_hp[0].color_group,
			c2_cls = pers_hp[1].color_group;


		var index = -1

		while (++index < p1_gts.length)
		{
			var c1_ht = c1_gts[index],
				c1_ds = c1_des[index];

/*			var m1_ht = m1_gts[index],
				m1_c
				m2_ht = m2_gts[index],
				p1_ht = p1_gts[index],
				p2_ht = p2_gts[index];

			if (c1_ds === 0){
				c1_col[index] = FounderColor.zero_color_grp;
			}
			// 
			else if (c1_ds === 1){
				if (c1_ht === f1_gts[index])
			}*/
		}
	}
}