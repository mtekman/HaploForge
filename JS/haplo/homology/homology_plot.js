
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


function removeScores(){

	if (markerInstance.line1 !== undefined){
		markerInstance.line1.destroy();
		markerInstance.line2.destroy();
	
		mscale_layer.draw();
	}
}


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
		r_height = slider_height,
		plen = specific_plot.length;


	if (marker_scale.line1 !== undefined){
		marker_scale.line1.destroy();
		marker_scale.line2.destroy();
	}

	var block_size = 10,
		lines = plotAxis3( specific_plot, stretch, score, block_size );
	
	var average_points = lines[0],
		inform_points = lines[1];

	var avline = new Kinetic.Line({
		x: rangeline.getX(),
		y: rangeline.getY(),
		points: average_points,
		stroke: 'green',	strokeWidth: 0.3,
		closed: true,	fill: 'green',	alpha: 0.3
	});

	avline.scaleY( block_size * r_height/plen );
	avline.scaleX(0.5)

	var infline = new Kinetic.Line({
		x: rangeline.getX(),	y: rangeline.getY(),
		points: inform_points,
		stroke: 'blue',		strokeWidth: 0.3,
		closed: true,	fill: 'blue',	alpha: 0.3
	});

	infline.scaleY( block_size * r_height/plen );
	infline.scaleX( 15 );

	marker_scale.line1 = avline;
	marker_scale.line2 = infline;

	marker_scale.add( marker_scale.line1 );
	marker_scale.add( marker_scale.line2 );

	marker_scale.line2.setZIndex(-99);
	marker_scale.line1.setZIndex(-99);

	mscale_layer.draw();
}


// given_plot is one of plots.het, plots.hom, plots.chet
// stretch min -- must have >0 for stretch min else 0
// score_min -- must have score > score_min else 0
function plotAxis3( given_plot, stretch_min, score_min, block_size )
{
	var plen = given_plot.length;

	var p=0,
		q=0,
		average_points = [0,-1],
		inform_points = [0,-1];

	var current_stretch_len = 0,
		in_hom_region_stretch = false;
	
	while (p < plen)
	{
		var average_x = 0,
			inform_x = 0; // <-- inform. within block, cannot overlap

		for (var b=0; b++ < block_size;)
		{
			var val = given_plot[p++];

			// Handle stretches
			if (val >= score_min){
				if (!(in_hom_region_stretch)){
					in_hom_region_stretch = true;
				}
				current_stretch_len ++
			}
			else{
				if (in_hom_region_stretch){
					in_hom_region_stretch = false;

					if (current_stretch_len >= stretch_min){
						inform_x += 1;
					}
				}
			}

			average_x += val;
		}
		average_x /= block_size;

		average_points.push(average_x, q)
		inform_points.push( inform_x, q);

		q++;
	}
	average_points.push(0,q+1);
	inform_points.push(0,q+1);


	return [average_points, inform_points];
}
