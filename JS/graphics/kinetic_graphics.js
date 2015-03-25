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
var mscale_layer = new Kinetic.Layer({
	id:"marker_scale",
	x:0, y:0,
	width:100,
	height: slider_height + 20
});

// ------------ Kinetic Tools --------------
function addSquare([c_x,c_y], color)
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


function addCircle([c_x,c_y], color)
{
	return new Kinetic.Circle({
		x: c_x, y: c_y, radius: nodeSize,
		fill: color, strokeWidth: 2,
		stroke: default_stroke_color
	})
}


function addDiamond([c_x,c_y], color){
	alert("fix lucy");
}



function addButton(message, xp, yp, callback){
	var group = new Kinetic.Group({x: xp, y: yp});

	var rec = new Kinetic.Rect({
		x: -5, y: -5,
		width: butt_w,
		height: butt_h,
		fill: 'grey',
		stroke: 'black',
		strokeWidth: 2
	});

	var tex = new Kinetic.Text({
		text: message,
		fontSize: 12,
		fill: 'white'
	});

	group.add(rec);
	group.add(tex);
	group.on('click', callback);

	return group;
}


function changeRLine(line, start, end)
{
	if (!use_right_angles) line.setPoints([start.x, start.y, end.x, end.y]);
	else {
		var mid_y = Math.floor((start.y + end.y)/2),
			m1    = {		x: start.x,		y: mid_y	},
			m2    = {		x: end.x,       y: mid_y	};

		line.setPoints([start.x, start.y, m1.x, m1.y, m2.x, m2.y, end.x, end.y]);
	}
}





function addRLine(fam_group, start, end, consang=false){
	var line = new Kinetic.Line({
		stroke: consang?'red':'black',
		strokeWidth: consang?4:2
	});
	changeRLine(line, start, end);

	fam_group.add(line);
	return line;
}



function finishDraw(){
	stage.add(main_layer);
	stage.add(haplo_layer);
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
	g.add(t);

	g.on('dblclick', function(){
		toggle_haplomode(fam_id);
		g.moveToTop();
	});

	main_layer.add(g);
	return g;
}


/* This should draw all of a single person's haplos in a loop
 Maybe try grabbing text across an entire family?
   - one text object, as opposed to n (for n fams in ped)
*/

function addHaploBlocks(data_tx, data_grp=0, fam=0)
{
	var grp = new Kinetic.Group({ x:0, y:((2*nodeSize)+10)});

	if (data_grp!==0){
		var haplo = new Kinetic.Group({});

		//Process blocks
		for (var j=0; j <2; j++)
		{
			var ind = 0;
			while (ind < data_grp[j].length)
			{
				var iter = ind,	 				// start of block
					color_group = data_grp[j][iter];

				while (  data_grp[j][++iter] === color_group
					   && iter < data_grp[j].length);

				var spac = Math.floor(HAP_VERT_SPA *1.5);

				var rec = new Kinetic.Rect({
					x: (HAP_VERT_SPA - 5) + j*spac,
					y: ((ind-2) * HAP_VERT_SPA),
					width: spac,
					height: (iter-ind) * HAP_VERT_SPA,
					fill: unique_colors[fam][color_group],
					strokeWidth: 1,
					stroke: 'white'
				});
				haplo.add( rec );

				ind = iter;
			}
		}
		grp.add(haplo);
	}

	var b1 = data_tx[0], 	// Haplotype
		b2 = data_tx[1];


	//Process Text
	var ind = -1, total_text="";
	while (++ind < b1.length)
		total_text += b1[ind] + "   " + b2[ind] +'\n';

	var tex = new Kinetic.Text({
		x:nodeSize,
		y: -nodeSize*2,
		text: total_text,
		fontFamily: slider_style.I_fontFamily,
		fontSize: 10,
		fill: 'black'
	});
	grp.add(tex);

	return grp;
}



function addHaploBlocksAll(haploinfos, fam =0)
{
	var grp = new Kinetic.Group({ x:0, y:((2*nodeSize)+10)});

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
					   && iter <= end_index);




				var rec = new Kinetic.Rect({
					x: haploblock_spacers.marker_offset_px + (
						(q * haploblock_spacers.person_offset_px)
						+ (j * haploblock_spacers.block_offset_px) ),
					y: ((ind - sta_index - 2) * HAP_VERT_SPA),
					width: haploblock_spacers.block_width_px,
					height: (iter-ind) * HAP_VERT_SPA,
					fill: unique_colors[fam][color_group],
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

		function addMale  () {  shape = addSquare ([0,0], col_affs[aff])   }
		function addFemale() {  shape = addCircle ([0,0], col_affs[aff])   }
		function addAmbig () {  shape = addDiamond([0,0], col_affs[aff])   }

		switch(gender){
			case 0: addAmbig() ; break;
			case 1: addMale()  ; break;
			case 2: addFemale(); break;
			default:
				assert(false, "No gender for index "+gender);
		}
		return shape;
	};

	var tex = new Kinetic.Text({
		x: - (""+id+"").length*3,	y: nodeSize + 10,
		text: id,
		fontSize: 'Calibri', //change to global setting
		fill: default_stroke_color
	});

	//Each person is their own group of inter-related ojects
	var group = new Kinetic.Group({
		x: t_x, y: t_y,
		draggable: true
	});
	group.add(makeshape());
	group.add(tex);


	//On drag do
	group.on('dragmove', function(e){
		//Snap-to-grid  -- relative to parent (fam_group)
		if (use_grid){
			var x = e.target.attrs.x;
			var	y = e.target.attrs.y;
			group.setX( (Math.floor(x/grid_rezX)*grid_rezX) );
			group.setY( (Math.floor(y/grid_rezY)*grid_rezY) );
		}
		redrawNodes(id, fam_group.attrs.id, true);
	});

	//Assume addFamily has already been called
	fam_group.add(group);
	return group;
}


