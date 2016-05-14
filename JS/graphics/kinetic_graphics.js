// ------------ Kinetic globals ------------
var stage = new Kinetic.Stage({
	container:'container',
	width: window.innerWidth,
	height: window.innerHeight
});

/* All nodes (even across seperate families) share the same node layer,
   but are bound by family_group stored in unique_graph_objs[fam_id].group; */

var main_layer = new Kinetic.Layer({id:"main"}),
	haplo_layer = new Kinetic.Layer({id:"haplo"});

// Seperate mini-layer for marker slider
/*var mscale_layer = new Kinetic.Layer({
	id:"marker_scale",
	x:0, y:0,
	width:100,
	height: slider_height + 20
});*/


// ------------ Kinetic Tools --------------
function addSquare(color)
{
	return new Kinetic.Rect({
		x: - nodeSize,
		y: - nodeSize,
		width: nodeSize *2,
		height: nodeSize * 2,
		fill: color,
		strokeWidth: 2,
		stroke: default_stroke_color
	});
}


function addCircle(color)
{
	return new Kinetic.Circle({
		x: 0, y: 0, radius: nodeSize,
		fill: color, strokeWidth: 2,
		stroke: default_stroke_color
	})
}


function addDiamond(color){

	var rect = addSquare(color);
	rect.setRotation(45);

	return rect;
}


function changeRLine(line, start, end, offset_y)
{
	offset_y = offset_y || 0;

	if (!use_right_angles) line.setPoints([start.x, start.y, end.x, end.y]);
	else {
		var mid_y = Math.floor((start.y + end.y)/2),
			m1    = {	x: start.x,		y: (mid_y + offset_y)	},
			m2    = {	x: end.x,   	y: (mid_y + offset_y)	};

		line.setPoints([start.x, start.y, m1.x, m1.y, m2.x, m2.y, end.x, end.y]);
	}
}


var overlapping_lines = {}; // ypos 

function linesConflictY( st, en, ypos)
{
	var margin = 1;

	// Test for conflict first
	for (var y = ypos - margin; y < ypos; y++)
		if (y in overlapping_lines)
			return true;

	//No conflict, add to line
	for (var y=ypos-5; y < ypos +5; y++)
		overlapping_lines[y] = true

	return false
}



function addRLine_nonoverlapY(start, end, consang)
{
	var offy = 0;
	while ( linesConflictY( start, end, offy ) ){
		// Add offset to midpoint
		offy -= 1;
	}

	return addRLine_simple(start,end, consang, offy);
}



function addRLine_simple(start, end, consang, offset_y)
{
	offset_y = offset_y || 0; // default


	var line = new Kinetic.Line({
		stroke: 'black',
		strokeWidth: 2
	});

	if(consang){
		line.attrs.shadowColor = 'black';
		line.attrs.shadowBlur = 0;
		line.attrs.shadowOffsetY = -nodeSize/3;
		line.attrs.shadowOpacity = 1;
	}
	changeRLine(line, start, end, offset_y);

	return line;
}



function addRLine(fam_group, start, end, consang)
{
	var line = addRLine_simple(start,end,consang)

	fam_group.add(line);
	return line;
}



function finishDraw(){
	stage.add(main_layer);
	stage.add(haplo_layer);
//	stage.add(mscale_layer)
}


// ------- Family Functions --------------
function addFamily(fam_id, sx, sy){
	var g = new Kinetic.Group({
		x: sx, y:sy,
		draggable: true,
		id: fam_id
	});


	var t = new Kinetic.Text({
		x: 50,
		text: fam_id,
		fontFamily: "Arial",
		fontSize: 18,
		fill: 'black'
	})
	g.fam_title_text = t;
	g.add(t);
	g.id = fam_id;

	t.on('mouseover', function(){
		t.setFill('red');
		main_layer.draw();
	});


	t.on('mousedown', function(){
		g.setScale({x:0.95, y:0.95});
	})

	t.on('mouseout mouseup', function(){
		g.setScale({x:1, y:1});
		t.setFill('black');
		main_layer.draw()
	})


	main_layer.add(g);
	return g;
}



// Over(under?)lays the haploblocks rendered if the
// homology mode is active/present.
function addHomologyPlotOverlay()
{
	// Note: Due to [x,y,x,y] specs, this is DOUBLE the marker length
	var current_specific_plot = rendered_filtered_plot;
	var npoints = [0,0];

	var count = 1;

	for (var i=sta_index; i <= end_index; i++){

		var x_coord = current_specific_plot[i*2],
			y_coord = current_specific_plot[(i*2)+1];

		var score_coord = (x_coord < 0)?0:x_coord*haploinfos.length*10;

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







function addHaploBlocksAll()
{
	var grp = new Kinetic.Group({ x:-50, y:((2*nodeSize)+10)});

	var haplo = new Kinetic.Group({});

	//Process blocks
	for (var q=0; q < haploinfos.length; q++)
	{

		for (var j=0; j <2; j++)
		{
			var one_hgroup = haploinfos[q][j].haplogroup_array;

			var ind = sta_index;
			while (ind <= end_index)
			{
				var iter = ind,	 				// start of block
					color_group = one_hgroup[iter];

				while (  one_hgroup[++iter] === color_group
					   && iter <= end_index){}




				var rec = new Kinetic.Rect({
					x: haploblock_spacers.marker_offset_px + (
						(q * haploblock_spacers.person_offset_px)
						+ (j * haploblock_spacers.block_offset_px) ),

					y: ((ind - sta_index - 2) * HAP_VERT_SPA),
					width: haploblock_spacers.block_width_px,
					height: (iter-ind) * HAP_VERT_SPA,

					fill: unique_colors[color_group],

					strokeWidth: 1,
					stroke: 'white'
				});
				haplo.add( rec );

				ind = iter;
			}
		}
		// For seeing the alignment

// 		haplo.add( new Kinetic.Line({
// 			x: (
// 				haploblock_spacers.marker_offset_px
// 				+ (q* haploblock_spacers.person_offset_px)
// 				+ haploblock_spacers.block_width_px
// 				+ 1),
// 			y: -200,
// 			points: [0,0,0,1000],
// 			strokeWidth:1,
// 			stroke:'red'
// 		}));


	}
	grp.add(haplo);


	// Text
	var total_text="";
	for (var m=sta_index; m <= end_index; m++)
	{
		total_text += marker_array[m] + haploblock_buffers.marker_offset;

		for (var i=0; i < haploinfos.length; i++)
			total_text +=  (haploblock_buffers.ht_offset
							+ haploinfos[i][0].data_array[m]
							+ haploblock_buffers.ht_2_ht
							+ haploinfos[i][1].data_array[m]);

		total_text +='\n';
	}
	var text = new Kinetic.Text({
		x: -38,
		y: -nodeSize*2,
		text: total_text,
		fontFamily: slider_style.I_fontFamily,
		fontSize: 10,
		fill: 'black'
	});
	grp.add(text);

	return grp;

}







function addPerson(person, fam_group,  t_x, t_y)  //positions relative to family group
{
	var gender = person.gender,
		id = person.id,
		aff = person.affected;


	//Add Shape and text Text
	var makeshape = function pedigreeShape(){
		var shape = 0;

		switch(gender){
			case 0: (function addAmbig() { shape = addDiamond(col_affs[aff]) })(); break;
			case 1: (function addMale()  { shape = addSquare (col_affs[aff]) })(); break;
			case 2: (function addFemale(){ shape = addCircle (col_affs[aff]) })(); break;
			default:
				assert(false, "No gender for index "+gender);
		}
		return shape;
	};


	var label = new Kinetic.Group({
		x: - (""+id+"").length*3,
		y: nodeSize + 10
	});

	var gfx = new Kinetic.Rect({
		fill: 'white',
		opacity: 0.8,
		y: - nodeSize/2,
		width: (""+id+"").length*6,
		height: 8
	});

	label.add(gfx);


	var texts = new Kinetic.Text({
		text: id,
		fontSize: 'Calibri', //change to global setting
		fill: default_stroke_color
	});
	label.add(texts);

	//Each person is their own group of inter-related ojects
	var group = new Kinetic.Group({
		x: t_x, y: t_y,
		draggable: true,
		id: fam_group.attrs.id+"_"+id
	});
	group.add(makeshape()).add(label);

	group.id = id;
	group.gfx = gfx;

	//On drag do
	group.on('dragmove', function(e){
		//Snap-to-grid  -- relative to parent (fam_group)
		if (use_grid){
			var x = e.target.attrs.x;
			var	y = e.target.attrs.y;
			group.setX( (Math.floor(x/grid_rezX)*grid_rezX) );
			group.setY( (Math.floor(y/grid_rezY)*grid_rezY) );
		}
		if (fam_group.id in family_map){
			redrawNodes(id, fam_group.attrs.id, true);
		}
	});

	//Assume addFamily has already been called
	fam_group.add(group);
	return group;
}


