
var HomologyMode = {

	plots: null,
	rendered_filtered_plot: null,
	selected_for_homology: null,

	_active : false,
	_type : "HOM",

	_minexten : 0,
	_minscore : 0,


	debugUpdatePlots: function(spec_plot, stretch, score){
		plotScoresOnMarkerScale( spec_plot, stretch, score )
	},

	printToFile: function( ht_ids, 
		start_index = 0, 
		stop_index = (marker_array.length - 1))
	{
		var text = "          ";

		// Headers
		for (var i=0; i < ht_ids.length; i++)
		{
			var f_id = ht_ids[i].split('_'),
				fid = f_id[0],
				id = f_id[1];

			var aff = (familyMapOps.getPerc(id,fid).affected == 2)?'a':'u';

			text += "\t"+id.toString()+'_'+aff
		}
		text += "\tHom  \tHet  \tChet\n"

		// Data
		for (var l=start_index; l <= stop_index; l++)
		{
			var marker = marker_array[l];
			text += marker

			for (var i=0; i < ht_ids.length; i++)
			{
				var f_id = ht_ids[i].split('_'),
					fid = f_id[0],
					id = f_id[1];

				var alleles = familyMapOps.getPerc(id,fid).haplo_data,
					a1 = alleles[0].data_array[l],
					a2 = alleles[1].data_array[l];

				text += '\t' + a1.toString() + "" + a2.toString()
			}

			var hom_v = plots.HOM[l],
				het_v = plots.HET[l],
				chet_v = plots.CHET[l];

			var score_columns = '\t ' + hom_v.toString() + '\t ' + het_v.toString() + '\t ' + chet_v.toString();
			score_columns = score_columns.replace(/ -/g, "-");

			text += score_columns + '\n';
		}
		// Write
		window.open(PersistData.makeTextFile(text));
	},

	removeScores: function(redrawtoo = true)
	{
		if ((MarkerSlider._instance !== null) && (MarkerSlider._instance.plotline !== undefined)){
			MarkerSlider._instance.plotline.destroy();
		
			if (redrawtoo){
				haplo_layer.draw();
			}
		}
	},

	plotScoresOnMarkerScale: function(specific_plot, stretch, score)
	{
		/* Grab rangeline and hang graphics from it.

		 Shape likely to be > 1000 px tall, and rangeline only 300 px,
		 which is a scale down of 3x that most pc's can handle
		 ~~~ hopefully Kinetic/canvas handles mipmaps efficiently
		     so I don't have to ~~~
		*/
		var marker_scale = MarkerSlider.showSlider(true),
			rangeline = marker_scale.rangeline,
			r_points = rangeline.getPoints(),
			r_height = r_points[3] - r_points[1],
			plen = specific_plot.length;

		HomologyMode.removeScores(false);

		var inform_points = HomologyMode.plotAxis4( specific_plot, stretch, score);
		rendered_filtered_plot = inform_points;
		
		var infline = new Kinetic.Line({
			x: rangeline.getX(),
			y: rangeline.getY(),
			points: inform_points,
			stroke: 'blue',		strokeWidth: 0.3,
			closed: true,	fill: 'blue',	alpha: 0.3
		});

		infline.scaleY( r_height/plen );
		infline.scaleX( 15 );

		marker_scale.plotline = infline;

		marker_scale.add( marker_scale.plotline );
		marker_scale.plotline.setZIndex(-99);

		haplo_layer.draw();
	},


	/* path finding over the entire plot, instead of slwindow*/
	plotAxis4: function( given_plot, stretch_min, score_min)
	{
		var new_plot = [];

		var current_stretch = 0;

		var plen = given_plot.length,
			p=0;		// lookahead_base
			// q=0; 	// lookahead_iterator
		while (p++ < plen)
		{
			if (given_plot[p] <= score_min){
				// new_plot[p] = 0; // <-- already true

				// End search
				if (current_stretch >= stretch_min){

					// qualifies, copy over results
					for (var q=p-(current_stretch+1); q++ < p;){
						new_plot[q] = given_plot[q]
					}
				}
				// Regardless, reset counter
				current_stretch = 0;
			}
			else {
				// Copy over NOTHING HERE -- happens retrospectively
				current_stretch ++;
			}
		}

		// Check if still qualifies at end
		if (current_stretch >= stretch_min){
			for (var q=p-(current_stretch+1); q++ < p;){
				new_plot[q] = given_plot[q]
			}
		}

		// Fill in blanks
		var return_xy = [];
		for (var p=0; p++ < plen;){
			new_plot[p] = new_plot[p] || 0;
			if (new_plot[p] <0) new_plot[p] = 0;

			return_xy.push( new_plot[p], p);
		}

		console.log( return_xy )
		return return_xy;
	}
}