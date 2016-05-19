

class MatelineDraw extends LineDrawOps {

	constructor(familyID)
	{
		super(familyID);

		this.startNodeID = null;
		this.endNodeID = null;

		// First click
		this._oncirclemousedown = function(circle, group){
			this.startNodeID = circle.id;
			console.log("startNodeID=", this.startNodeID);
		}

		// Second click
		this._oncirclemousedown_final = function(circle){
			//Add line to unique_graph_obs so that dragevents would update it
			//But ONLY after the relationship has been set

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

			this.endNodeID = circle.id;
			console.log("endNodeID=", this.endNodeID)

			var person1 = personDraw.used_ids[Number(this.startNodeID)],
				person2 = personDraw.used_ids[Number(this.endNodeID)];

			if (person1.id === 0 || person2.id === 0){
				console.log("Not possible");
				return;
			}

			person1	= family_map[this._family][person1.id];
			person2	= family_map[this._family][person2.id];

			if (person1.gender === person2.gender){
				var type = {0: 'unknowns',
							1: 'males, not yet applicable',
							2: 'females, not yet applicable'};

				utility.notify("Error:", "Cannot join two " + type[person1.gender]);
				return;
			}


			var moth = (person1.gender===2)?person1:person2,
				fath = (person1.gender===1)?person1:person2;

			moth.mates.push(fath);
			fath.mates.push(moth);

			// Need to manually insert the line
			var u_matesline = UUID('m', fath.id, moth.id);

			var line_pos = this._tmpLine.getPosition(),
				fam_group = unique_graph_objs[this._family].group,
				group_pos = fam_group.getAbsolutePosition(),
				new_line = this._tmpLine.clone();

			fam_group.add(new_line);

			new_line.setX(line_pos.x - group_pos.x);
			new_line.setY(line_pos.y - group_pos.y);

			addFamMap.incrementEdges(
				u_matesline, fath.id, moth.id, 0,
				unique_graph_objs[this._family].edges,
				new_line
			)
			new_line.setZIndex(1);

			//reset
			this.endLineDraw();
			main_layer.draw();
		}
	}
};