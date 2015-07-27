
function debugUpdatePlots(spec_plot, stretch, score)
{
	plotScoresOnMarkerScale( spec_plot, stretch, score )
}


// For debugging
//printToFile( ["107_6","107_7","107_8","107_9","107_10"])
function printToFile( ht_ids, start_index, stop_index )
{
	start_index = start_index || 0;
	stop_index = stop_index || (marker_array.length -1);

	var text = "          ";


	// Headers
	for (var i=0; i < ht_ids.length; i++)
	{
		var f_id = ht_ids[i].split('_'),
			fid = f_id[0],
			id = f_id[1];

		var aff = (family_map[fid][id].affected == 2)?'a':'u';

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

			var alleles = family_map[fid][id].haplo_data,
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
	var textFile = null,
		makeTextFile = function(tex)
		{
			var data = new Blob([tex],{type:'text/plain'});

			if (textFile !== null) window.URL.revokeObjectURL(textFile);

			textFile = window.URL.createObjectURL(data);
			return textFile;
		};

	window.open(makeTextFile(text));
}


function removeScores(redrawtoo){

	redrawtoo = redrawtoo || true;

	if (markerInstance.plotline !== undefined){
		markerInstance.plotline.destroy();
	
		if (redrawtoo) mscale_layer.draw();
	}
}


var infline;

function plotScoresOnMarkerScale (specific_plot, stretch, score)
{
	/* Grab rangeline and hang graphics from it.

	 Shape likely to be > 1000 px tall, and rangeline only 300 px,
	 which is a scale down of 3x that most pc's can handle
	 ~~~ hopefully Kinetic/canvas handles mipmaps efficiently
	     so I don't have to ~~~
	*/
	var marker_scale = showSlider(true),
		rangeline = marker_scale.rangeline,
		r_points = rangeline.getPoints(),
		r_height = r_points[3] - r_points[1],
		plen = specific_plot.length;

	removeScores(false);

	var inform_points = plotAxis4( specific_plot, stretch, score);
	
	infline = new Kinetic.Line({
		x: rangeline.getX(),	y: rangeline.getY(),
		points: inform_points,
		stroke: 'blue',		strokeWidth: 0.3,
		closed: true,	fill: 'blue',	alpha: 0.3
	});

	infline.scaleY( r_height/plen );
	infline.scaleX( 15 );

	marker_scale.plotline = infline;

	marker_scale.add( marker_scale.plotline );
	marker_scale.plotline.setZIndex(-99);

	mscale_layer.draw();
}

/* path finding over the entire plot, instead of slwindow*/
function plotAxis4( given_plot, stretch_min, score_min)
{

//	var new_plot = new Int8Array(given_plot.length);
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
				for (var q=p-current_stretch; q++ < p;){
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
		for (var q=p-current_stretch; q++ < p;){
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