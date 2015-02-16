// ------------ Kinetic globals ------------
var stage = new Kinetic.Stage({
	container:'container',
	width: window.innerWidth,
	height: window.innerHeight
});

var node_layer = new Kinetic.Layer(),
	line_layer = new Kinetic.Layer(); //Below node_layer

var line_map = {},
	node_map = {};

//Two representations of data -- unique_graph_objs (holding person data + x,y), and graphic maps above
//TODO: remove duplicity. Ideally unique_graph_objs --> {kinetic_key, people data}




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


function addRLine(key, [s_x, s_y], [e_x, e_y]){
	var ln = new Kinetic.Line({
		points: [s_x, s_y, e_x, s_y, e_x, e_y],
		stroke: 'black',
		strokeWidth: 2
	});

	line_layer.add(ln);
	line_map[key] = ln;
}



function addPerson(coords, id, gender, aff)
{
	var rez = 0;

	function addMale  () {  rez = addSquare ([0,0], col_affs[aff])   }
	function addFemale() {  rez = addCircle ([0,0], col_affs[aff])   }
	function addAmbig () {  rez = addDiamond([0,0], col_affs[aff])   }

	switch(gender){
		case 0: addAmbig(); break;
		case 1: addMale(); break;
		case 2: addFemale(); break;
		default:
			assert(false, "No gender for index "+gender);
	}
	//Add Text
	var tex = new Kinetic.Text({
		x: - (""+id+"").length*3,
		y: nodeSize + 8,
		text: id,
		fontSize: 'Calibri', //change to global setting
		fill: default_stroke_color
	});

	var group = new Kinetic.Group({
		x: coords[0], y: coords[1],
		draggable: true
	});

	node_map[id] = group;

	group.add(rez);
	group.add(tex);

	//On drag do
	group.on('dragmove', function(e){
		//Snap-to-grid
		var x = e.target.attrs.x, y = e.target.attrs.y;
		group.setX( Math.floor(x/grid_rez)*grid_rez );
		group.setY( Math.floor(y/grid_rez)*grid_rez );

		redrawSpecificLines(id);
	});


	node_layer.add(group);
}



function finishDraw(){
	stage.add(line_layer);
	stage.add(node_layer);
}
