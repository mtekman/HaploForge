// ------------ Kinetic globals ------------
var stage = null;

/* All nodes (even across seperate families) share the same node layer,
   but are bound by family_group stored in uniqueGraphOps.getFam(fam_id).group; */

var main_layer = null, 
	haplo_layer = null;

// --- Init Kinetic --//
function makeStage(){

	if (stage !== undefined){
		stage = null;
		main_layer = null;
		haplo_layer = null;
	}

	stage = new Kinetic.Stage({
		container:'container',
		width: window.innerWidth,
		height: window.innerHeight
	});

	main_layer = new Kinetic.Layer({id:"main"});
	haplo_layer = new Kinetic.Layer({id:"haplo"});
}


// ------------ Kinetic Tools --------------
function addSquare(color)
{
	return new Kinetic.Rect({
		x: 0,
		y: 0,
		width: nodeSize *2,
		height: nodeSize * 2,
		fill: color,
		strokeWidth: 2,
		stroke: default_stroke_color,
		offsetX: nodeSize,
		offsetY: nodeSize
	});
}


function addCircle(color, rad=nodeSize)
{
	return new Kinetic.Circle({
		x: 0, y: 0, radius: rad,
		fill: color, strokeWidth: 2,
		stroke: default_stroke_color
	})
}

function addDiamond(color){

	var rect = addSquare(color);
	rect.setRotation(45)
	rect.setScale({x:0.8,y:0.8});

	return rect;
}


function changeRLine(line, start, end, offset_y = 0, offset_pos = null)
{
	if (offset_pos !== null)
	{
		start.x += offset_pos.x;
		start.y += offset_pos.y;
		console.log("adding offset", offset_pos)
	}

	try {
		line.setX(start.x);
		line.setY(start.y);
	} catch(e){
		console.log("what is line", line)
		throw new Error(line)
	}

	var diff_x = end.x - start.x,
		diff_y = end.y - start.y;

	var mid_x = diff_x/2,
		mid_y = diff_y/2;


	var	m1    = {	x: 0,			y: (mid_y + offset_y)	},
		m2    = {	x: diff_x,   	y: (mid_y + offset_y)	};

	line.setPoints([0, 0, m1.x, m1.y, m2.x, m2.y, diff_x, diff_y]);

	// SibLine node anchor (where applicable)
	if (typeof line.sib_anchor !== "undefined"){
		var mid_midx = (m1.x + m2.x) / 2,
			mid_midy = (m1.y + m2.y) / 2;

		line.sib_anchor.setX(mid_midx);
		line.sib_anchor.setY(mid_midy);
	}
}


/* Used in matelines. Optionally supports a mid-point node -- for a siblines to latch onto */
function changeRLineHoriz(line, start, end, offset_pos = null)
{
	if (offset_pos !== null)
	{
		start.x += offset_pos.x;
		start.y += offset_pos.y;
	}

	line.setX(start.x);
	line.setY(start.y);

	var diff_x = end.x - start.x,
		diff_y = end.y - start.y;

	var mid_x = diff_x/2,
		mid_y = diff_y/2;
	
	var	m1    = {	y: 0,	   x: mid_x	},
		m2    = {	y: diff_y, x: mid_x	};

	line.setPoints([0, 0, m1.x, m1.y, m2.x, m2.y, diff_x, diff_y]);

	// SibLine node anchor (where applicable)
	if (typeof line.sib_anchor !== "undefined"){
		var mid_midx = (m1.x + m2.x) / 2,
			mid_midy = (m1.y + m2.y) / 2;

		line.sib_anchor.setX(start.x + mid_midx);
		line.sib_anchor.setY(start.y + mid_midy);
	}

//	return {mid1:m1,mid2:m2} /* Useful for spawning of Siblines */
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
		text: ""+fam_id+"",
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
		familyDraw.active_fam_group = g;
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

					fill: FounderColor.unique[color_group],

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
		total_text += MarkerData.rs_array[m] + haploblock_buffers.marker_offset;

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
		fontFamily: MarkerSlider._style.I_fontFamily,
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
		aff = person.affected,
		name = person.name || null;


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

	label.add(new Kinetic.Rect({
		fill: 'white',
		opacity: 0.8,
		y: - nodeSize/2,
		width: (""+id+"").length*6,
		height: 8
	}));

	var texts = new Kinetic.Text({
		text: id,
		fontSize: 'Calibri', //change to global setting
		fill: default_stroke_color
	});
	label.add(texts);


	// Name
	if (name !== null)
	{
		var namlen = name.length,
			offY = (nodeSize*4) - 2,
			offX = ((namlen/2) - (namlen%2)) * 4;

		label.add(new Kinetic.Rect({
			fill: 'white',
			opacity: 0.8,
			y: - nodeSize/2,
			width: name.length*6,
			height: 8,
			offsetY: offY,
			offsetX: offX // Center, then 3px for each letter

		}));

		label.add(new Kinetic.Text({
			text: name,
			fontSize: 'Calibri',
			fill: default_stroke_color,
			offsetY: offY,
			offsetX: offX // Center, then 3px for each letter
		}));
	}

	//Each person is their own group of inter-related ojects
	var group = new Kinetic.Group({
		x: t_x, y: t_y,
		draggable: true,
		id: fam_group.attrs.id+"_"+id
	});

	var gfx = makeshape();

	group.add(gfx).add(label);

	group.id = id;
	group.gfx = gfx;

	//On drag do
	group.on('dragmove', function(e){
		// Update last touched group
		familyDraw.active_fam_group = fam_group;

		var x = e.target.attrs.x;
		var	y = e.target.attrs.y;

		if (Keyboard.isShiftDown()){
			e.target.dragBoundFunc
			main_layer.draw();
			return 0;
		}
		
		//Snap-to-grid  -- relative to parent (fam_group)
		this.setX( (Math.floor(x/grid_rezX)*grid_rezX) );
		this.setY( (Math.floor(y/grid_rezY)*grid_rezY) );


		if (familyMapOps.famExists(fam_group.id)){
			redrawNodes(id, fam_group.attrs.id, true);
		}
	});

	//Assume addFamily has already been called
	fam_group.add(group);
	return group;
}


