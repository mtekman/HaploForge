import MouseStyle from '/JS/iofuncs/mousestyle.js';
import uniqueGraphOps from '/JS/pedigree/uniquegraphops.js';
import FamSpacing from '/JS/mode/graph/famgroupspacing.js';
import familyDraw from '/JS/mode/pedcreate/familyDraw.js';
import { redrawNodes } from '/JS/mode/graph/graph_draw.js';
import { error } from '/JS/globals.js';

// ------------ Kinetic globals ------------
var stage = null;

/* All nodes (even across seperate families) share the same node layer,
   but are bound by family_group stored in uniqueGraphOps.getFam(fam_id).group; */

var main_layer = null,
	haplo_layer = null;

// --- Init Kinetic --//
function makeStage(){

	if (stage !== undefined && stage !== null){
		delete stage;
		delete main_layer;
		delete haplo_layer;
	}

	//if (stage === undefined){
		stage = null;
		main_layer = null;
		haplo_layer = null;
	//}

	stage = new Kinetic.Stage({
		container:'container',
		width: window.innerWidth,
		height: window.innerHeight,
		draggable: true
	});

	main_layer = new Kinetic.Layer({
		id:"main"
	});
	haplo_layer = new Kinetic.Layer({id:"haplo"});

	stage.add(main_layer);
	stage.add(haplo_layer);
}


// ------------ Kinetic Tools --------------
var Graphics = {

	Shapes : {

		addSquare: function(color)
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
		},

		addCircle: function(color, rad=nodeSize)
		{
			return new Kinetic.Circle({
				x: 0, y: 0, radius: rad,
				fill: color, strokeWidth: 2,
				stroke: default_stroke_color
			})
		},

		addDiamond: function(color){

			var rect = Graphics.Shapes.addSquare(color);
			rect.setRotation(45)
			rect.setScale({x:0.8,y:0.8});

			return rect;
		}
	},

	Lines : {

		changeRLine: function(line, start, end, offset_y = 0, offset_pos = null)
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
				error(line)
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
		},

		/* Used in matelines. Optionally supports a mid-point node -- for a siblines to latch onto */
		changeRLineHoriz: function(line, start, end, offset_pos = null)
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
		},

		overlapping_lines : {}, // ypos

		linesConflictY: function( st, en, ypos)
		{
			var margin = 1;

			// Test for conflict first
			for (var y = ypos - margin; y < ypos; y++)
				if (y in Graphics.Lines.overlapping_lines)
					return true;

			//No conflict, add to line
			for (var y=ypos-5; y < ypos +5; y++)
				Graphics.Lines.overlapping_lines[y] = true

			return false
		},

		addRLine_nonoverlapY: function(start, end, consang)
		{
			var offy = 0;
			while ( Graphics.Lines.linesConflictY( start, end, offy ) ){
				// Add offset to midpoint
				offy -= 1;
			}

			return Graphics.Lines.addRLine_simple(start,end, consang, offy);
		},

		addRLine_simple(start, end, consang, offset_y)
		{
			offset_y = offset_y || 0; // default

			var line = new Kinetic.Line({
				stroke: 'black',
				strokeWidth: 2
			});

			if (consang){
				line.attrs.shadowColor = 'black';
				line.attrs.shadowBlur = 0;
				line.attrs.shadowOffsetY = -nodeSize/3;
				line.attrs.shadowOpacity = 1;
			}
			Graphics.Lines.changeRLine(line, start, end, offset_y);

			return line;
		},

		addRLine: function(fam_group, start, end, consang)
		{
			var line = Graphics.Lines.addRLine_simple(start,end,consang)

			fam_group.add(line);
			return line;
		}
	},



	// ------- Family Functions --------------
	Pedigree : {

		addFamily: function(fam_id, sx, sy){

			var g = new Kinetic.Group({
				x: sx, y:sy,
				draggable: true,
				id: fam_id
			});

			var bounds = new Kinetic.Rect({
				x: sx, y:sy,
				draggable : false,
				stroke: "red",
				strokeWidth: 1
			});

			g._boundsrect = bounds;
			g.add(bounds);

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
				MouseStyle.changeToGrab();
				t.setFill('red');
				g._boundsrect.show();
				main_layer.draw();
			});


			t.on('mousedown', function(){
				MouseStyle.changeToMove();
				g.setScale({x:0.95, y:0.95});
				familyDraw.active_fam_group = g;
				g.moveToTop();
			})

			t.on('mouseout mouseup', function(){
				MouseStyle.restoreCursor();
				g.setScale({x:1, y:1});
				t.setFill('black');
				g._boundsrect.hide();
				main_layer.draw();
			})


			main_layer.add(g);
			return g;
		},

		addPerson : function(person, fam_group,  t_x, t_y)  //positions relative to family group
		{
			var gender = person.gender,
				id = person.id,
				aff = person.affected,
				name = person.name || null;


			//Add Shape and text Text
			var makeshape = function pedigreeShape(){
				var shape = 0;

				switch(gender){
					case 0: (function addAmbig() { shape = Graphics.Shapes.addDiamond(col_affs[aff]) })(); break;
					case 1: (function addMale()  { shape = Graphics.Shapes.addSquare (col_affs[aff]) })(); break;
					case 2: (function addFemale(){ shape = Graphics.Shapes.addCircle (col_affs[aff]) })(); break;
					default:
						console.assert(false, "No gender for index "+gender);
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


		//		if (familyMapOps.famExists(fam_group.id)){
					redrawNodes(id, fam_group.attrs.id, true);
		//		}
			});

			group.on("dragend", function(){
				Graphics.Pedigree.updateFamBoundsRect(fam_group);
				redrawNodes(id, fam_group.attrs.id, true);
			});

			//Assume addFamily has already been called
			fam_group.add(group);
			return group;
		},

		updateFamBoundsRect: function(fgroup)
		{
			var new_bounds = FamSpacing.getBoundsForFamily(fgroup),
				new_rect = new_bounds.rect,
				minpos = new_bounds.minpos;

			var buffer = nodeSize * 2;


			fgroup._boundsrect.setX(minpos.x - buffer);
			fgroup._boundsrect.setY(minpos.y - buffer);
			fgroup._boundsrect.setWidth(new_rect.getWidth() + 2*buffer);
			fgroup._boundsrect.setHeight(new_rect.getHeight() + 2*buffer);
		}
	}
}
