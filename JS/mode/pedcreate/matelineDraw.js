import familyMapOps from '/JS/pedigree/familymapops.js';
import uniqueGraphOps from '/JS/pedigree/uniquegraphops.js';
import { edgeAccessor, redrawNodes, touchlines } from '/JS/mode/graph/graph_draw.js'

class MatelineDraw extends LineDrawOps {

	constructor(familyID, startID = null, endID = null)
	{
		super(familyID);

		this.startNodeID = startID;
		this.endNodeID = endID;

		this.matelineID = null;

		// First click
		this._oncirclemousedown = function(circle, group){
			this.startNodeID = circle.id;
			console.log("startNodeID=", this.startNodeID);
		}

		// Second click
		this._oncirclemousedown_final = function(circle){
			this.endNodeID = circle.id;
			console.log("endNodeID=", this.endNodeID)

			this._joinIDs()
		}

		// If IDs set in constructor, just perform a join.
		if (this.endNodeID !== null){
			this._joinIDs();
		}
	}


	_joinIDs(){
		// Add line to unique_graph_obs so that dragevents would update it
		// But ONLY after the relationship has been set

		// Rules:
		//   1. Two types of lines
		//      a. Mateline
		//      b. Parentline
		//
		//   2. Parentline hangs from center of Mateline
		//      there requires a Mateline to be present before creation
		//
		//   3. There needs to be a temp node hanging in the center of mateline to
		//      join offspring to.

		// Mates aren't connected in family map, only in unique_graph_lines
		var person1 = personDraw.used_ids[Number(this.startNodeID)],
			person2 = personDraw.used_ids[Number(this.endNodeID)];

		if (person1.id === 0 || person2.id === 0){
			console.log("Not possible");
			return;
		}

		person1	= familyMapOps.getPerc(person1.id, this._family);
		person2	= familyMapOps.getPerc(person2.id, this._family);

		if (person1.gender === person2.gender){
			var type = {0: 'unknowns',
						1: 'males, not yet applicable',
						2: 'females, not yet applicable'};

			utility.notify("Error:", "Cannot join two " + type[person1.gender]);
			return;
		}


		var moth = (person1.gender===PED.FEMALE)?person1:person2,
			fath = (person1.gender===PED.MALE)?person1:person2;

		moth.addMate(fath);
		fath.addMate(moth);

		// Need to manually insert the line
		var u_matesline = edgeAccessor.matelineID(fath.id, moth.id);
		this.matelineID = u_matesline;  // Not used internally

		// If line does not exist -- (because ids are declared and user-set) -- create one
		if (this._tmpLine === null){
			console.log("creating new dummy line");
			this._tmpLine = new Kinetic.Line({
				stroke: 'black',
				strokeWidth: 2,
				points: [0,0,1,1,2,2]
			});
		}
		else {
			// Perform horizontal flip if neccesary on existing line
			var points = this._tmpLine.getPoints();
			//console.log(points)

			if (points[0] > points[6]){
				console.log("invert!");
				//invert line -- only four points do it manually
				var inverted = [
					-points[6], -points[7],
					-points[4], -points[5],
					-points[2], -points[3],
					-points[0], -points[1]
				];

				this._tmpLine.setPoints(inverted);
			}
		}

		var fam_gfx = uniqueGraphOps.getFam(this._family),
			fam_group = fam_gfx.group,
			group_pos = fam_group.getAbsolutePosition(),

			points = this._tmpLine.getPoints(),
			start = {x:points[0], y:points[1]},
			end = {x:points[6], y:points[7]},

			consang = checkConsanginuity(fam_group.id, this.startNodeID, this.endNodeID),
			new_line = Graphics.Lines.addRLine(fam_group, start, end, consang);

		this._tmpLine.destroy();

		var fath_gfx = fam_gfx.nodes[moth.id].graphics.getPosition();

		new_line.setX( fath_gfx.x );
		new_line.setY( fath_gfx.y );


		uniqueGraphOps.insertEdge(
			u_matesline, fam_group.id, new_line,
			fath.id,
			moth.id,
			0,
			consang
		)
		new_line.setZIndex(1);

		GlobalLevelGrid.refreshGrid(this._family);

		//reset
		this.endLineDraw();
		redrawNodes(fath.id, this._family, true);
		touchlines();
		main_layer.draw();
	}



};
