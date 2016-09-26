
var HomologyPlot = {

	plots: null,
	rendered_filtered_plot: null,

	_type : "HOM",

	debugUpdatePlots: function(spec_plot, stretch, score){
		HomologyPlot.plotScoresOnMarkerScale( spec_plot, stretch, score )
	},

	printToFile: function( ht_ids, 
		start_index = 0, 
		stop_index = (MarkerData.rs_array.length - 1))
	{
		var text = "          ";

		// Headers
		for (var i=0; i < ht_ids.length; i++)
		{
			var f_id = ht_ids[i].split('_'),
				fid = f_id[0],
				id = f_id[1];

			var aff = (familyMapOps.getPerc(id,fid).affected == PED.AFFECTED)?'a':'u';

			text += "\t"+id.toString()+'_'+aff
		}
		text += "\tHom  \tHet  \tChet\n"

		// Data
		for (var l=start_index; l <= stop_index; l++)
		{
			var marker = MarkerData.rs_array[l];
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

			var hom_v = HomologyPlot.plots.HOM[l],
				het_v = HomologyPlot.plots.HET[l],
				chet_v = HomologyPlot.plots.CHET[l];

			var score_columns = '\t ' + hom_v.toString() + '\t ' + het_v.toString() + '\t ' + chet_v.toString();
			score_columns = score_columns.replace(/ -/g, "-");

			text += score_columns + '\n';
		}
		// Write
		exportToTab(text);
	},

	removeScores: function(redrawtoo = true)
	{
		if ((MarkerSlider._instance !== null)
		 && (MarkerSlider._instance.plotline !== undefined))
		{
			MarkerSlider._instance.plotline.destroy();
		
		}
		HomologyPlot.rendered_filtered_plot = null;
		
		if (redrawtoo){
			HaploBlock.redrawHaplos();
			//haplo_layer.draw();
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

		MarkerSlider.makeVisible(true);

		var marker_scale = MarkerSlider._instance,
			rangeline = marker_scale.rangeline,
			r_points = rangeline.getPoints(),
			r_height = r_points[3] - r_points[1],
			plen = specific_plot.length;

		HomologyPlot.removeScores(false);

		var inform_points = HomologyPlot.plotAxis4( specific_plot, stretch, score);
		
		// Insert [0,0] at the start
		inform_points.splice(0,0,0)
		inform_points.splice(0,0,0)

		HomologyPlot.rendered_filtered_plot = inform_points;
		
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
		return return_xy;
	},


	// Over(under?)lays the haploblocks rendered if the
	// homology mode is active/present.
	addHomologyPlotOverlay()
	{
		// Note: Due to [x,y,x,y] specs, this is DOUBLE the marker length
		var current_specific_plot = HomologyPlot.rendered_filtered_plot;
		var npoints = [0,0];

		var count = 1;

		for (var i=HaploBlock.sta_index; i <= HaploBlock.end_index; i++){

			var x_coord = current_specific_plot[i*2],
				y_coord = current_specific_plot[(i*2)+1];

			var score_coord = (x_coord < 0)?0:x_coord*HaploBlock.haploinfos.length*10;

			var y_initial = (count) * HAP_VERT_SPA,
				y_next = (count +1) * HAP_VERT_SPA;

			npoints.push( score_coord, y_initial)
			npoints.push( score_coord, y_next)

			// It may seem like regions overlap over subsequent iterations,
			// but bear in mind that they do so at different score positions.
			count ++;
		}
		npoints.push( 0, (count) * HAP_VERT_SPA)



		return line = new Kinetic.Line({
			x: -haploblock_spacers.marker_offset_px - 20,
			y: HAP_VERT_SPA,
			stroke: 'red',
			strokeWidth: 1,
			closed: true,
			fill: 'red',
			opacity: 0.3,
			points: npoints
		});
	}

}