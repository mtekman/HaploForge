// ------------ Kinetic globals ------------
var stage = new Kinetic.Stage({
	container:'container',
	width: window.innerWidth,
	height: window.innerHeight
});

/* All nodes (even across seperate families) share the same node layer,
   but are bound by family_group stored in unique_graph_objs[fam_id].group; */

var main_layer = new Kinetic.Layer();

//Create a seperate layer for haplomode!!!!


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


/* This should draw all haplos in a loop */
function addHaploBlocks(data){
	var b1 = data[0],
		b2 = data[1];

	var grp = new Kinetic.Group({ x:0, y:((2*nodeSize)+10)});

	var ind = 0;
	while (ind < b1.length){
		var tex = new Kinetic.Text({
			x:-nodeSize,
			y:ind*10,
			text: b1[ind].data+"  "+b2[ind].data,
			fontFamily: "Arial",
			fontSize: 10,
			fill: 'black'
		});
		ind ++;
		grp.add(tex);
	}
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


