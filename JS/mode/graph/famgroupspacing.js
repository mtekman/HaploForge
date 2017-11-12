import familyMapOps from '/JS/pedigree/familymapops.js';
import uniqueGraphOps from '/JS/pedigree/uniquegraphops.js';

export default var FamSpacing = {


	init(offset, max_width, debug = false){
		max_width = max_width || stage.getWidth();
		offset = offset || 0;

		var placements = FamSpacing.__getFamBounds();

		FamSpacing.__performPacking(placements, max_width, debug);
		FamSpacing.__setDerivedPositions(placements, offset);
	},

	// Accessible to node drag functions too
	getBoundsForFamily: function(fgroup){
		// Get group width
		var min_x = 999999999, min_y = 9999999,
			max_x = 0, max_y = 0;

		var title_y = fgroup.fam_title_text.getY();

		uniqueGraphOps.foreachnode(function(nid, node)
		{
			if (node.graphics === null){
				console.log("Skipping individual", nid, " due to no graphics and deleting them");
				uniqueGraphOps.deleteNode(nid, fgroup.id);

				if (familyMapOps.percExists(nid, fgroup.id)){
					familyMapOps.removePerc(nid, fgroup.id);
				}
				return -1;
			}

			var xer = node.graphics.getX(),
				yer = node.graphics.getY()

			var l_offs = nodeSize,
				r_offs = l_offs;

			if (min_x > xer - l_offs  ){ min_x = xer - l_offs; }
			if (max_x < xer + r_offs  ){ max_x = xer + r_offs; }
			if (min_y > yer - nodeSize){ min_y = yer - nodeSize; }
			if (max_y < yer + nodeSize){ max_y = yer + nodeSize; }

		}, fgroup.id);

//		var min_y = title_y

		var pos = fgroup.getAbsolutePosition();
		var w = max_x - min_x,
			h = max_y - min_y;

		var rect = new Kinetic.Rect({
			x:min_x + pos.x,
			y:min_y + pos.y,
			stroke:"red",
			strokeWidth: 2,
			width: w,
			height: h
		});

		// Move out of way for now
		rect.setX(-1000);
		rect.setY(-1000);
		rect.setVisible(false);

		main_layer.add(rect);

		return {rect: rect, minpos: { x: min_x, y: min_y}};
	},


	__getFamBounds : function()
	{
		var fam_placements = {}; // fid -> [position, width]

		uniqueGraphOps.foreachfam(function(fid,fgr)
		{
			fgr.group.hide();
			fam_placements[fid] = FamSpacing.getBoundsForFamily(fgr.group);

		});
		return fam_placements;
	},


	__performPacking : function(fam_placements, max_width, debug = false)
	{
		var start_x = nodeSize,
			start_y = 50;

		var total_width = max_width,
			ma_rect;

		if (debug){
			ma_rect = new Kinetic.Rect({
				x:total_width,
				y:0,
				stroke:"blue",
				strokeWidth: 2,
				width: 5,
				height: stage.getHeight()
			});

			main_layer.add(ma_rect);
			main_layer.draw();
		}

		for (var group_id in fam_placements)
		{
			var group = fam_placements[group_id].rect;

			group.setX( start_x );
			group.setY( start_y );

			while (true) {
				var any_collision = false;

				for (var second_id in fam_placements)
				{
					if (group_id === second_id){
						continue;
					}

					var second_group = fam_placements[second_id].rect;

					if (FamSpacing.__colliding(group, second_group)){
						any_collision = true;
						break;
					}
				}

				if (any_collision){
					// shift left;
					start_x += nodeSize * 3;
					if (start_x + group.getWidth()*4/5 > total_width)
					{
						start_x = nodeSize * 5;
						start_y += nodeSize * 4;
					}
					group.setX(start_x);
					group.setY(start_y);

					if (debug){
						main_layer.draw();
						debugger;
					}
					continue;
				}

				// No collision after testing all -- final position found.
				break;
			}
		}

		if (debug){
			ma_rect.destroy();
		}

	},


	__setDerivedPositions: function(fam_placements, offsetT = 0)
	{
		for (var g_id in fam_placements)
		{
			var group = fam_placements[g_id].rect,
				offset  = fam_placements[g_id].minpos,
				offx = offset.x,
				offy = offset.y,
				fgroup = uniqueGraphOps.getFam(g_id).group;

			fgroup.setX( group.getX() + offsetT - offx );
			fgroup.setY( group.getY() + offsetT - offy );
			fgroup.show();

			//Remove rects after ananlyis
			group.destroy();
		}
	},

	__colliding: function(r1,r2){
	 	var spacing = nodeSize * 2 ;

		var rect1 = {x: r1.getX(), y: r1.getY(),
			width: r1.getWidth() + spacing,
			height: r1.getHeight() + spacing
		}
		var rect2 = {x: r2.getX(), y: r2.getY(),
			width: r2.getWidth() + spacing,
			height: r2.getHeight() + spacing
		}

		if (rect1.x < rect2.x + rect2.width &&
	   		rect1.x + rect1.width > rect2.x &&
	   		rect1.y < rect2.y + rect2.height &&
	   		rect1.height + rect1.y > rect2.y) {

	    	return true;
		}
	    return false;
	}
}



/*
function spaceFamGroups2(){

	var fam_placements = {}; // fid -> [position, width]

	familyMapOps.foreachfam(function(fid){

		// Get group width
		var min_x = 999999999, min_y = 9999999,
			max_x = 0, max_y = 0;

		var famgfx = uniqueGraphOps.getFam(fid),
			fgroup = famgfx.group,
			title_pos = fgroup.fam_title_text.getX(),
			title_wid = fgroup.fam_title_text.getWidth();

		uniqueGraphOps.foreachnode(function(nid, node)
		{
			var xer = node.graphics.getX(),
				yer = node.graphics.getY()

			var l_offs = nodeSize,
				r_offs = l_offs;

			if (min_x > xer - l_offs){ min_x = xer - l_offs; }
			if (max_x < xer + r_offs){ max_x = xer + r_offs; }

			if (min_y > yer - nodeSize){ min_y = yer - nodeSize; }
			if (max_y < yer + nodeSize){ max_y = yer + nodeSize; }

			if (fid === "1001"){
				console.log(fid, min_x, max_x)
			}

		}, fid);

		var group_pos = fgroup.getAbsolutePosition(),
			group_width = max_x - min_x,
			group_height = max_y - min_y;

		fam_placements[fid] = [fgroup, {x : {min:min_x, max:max_x}, y: {min: min_y, max: max_y}}, group_width, group_height, title_pos];
		console.log(fid, fam_placements[fid])
	});

	var start_x = nodeSize * 5,
		start_y = 50;

	var total_width = stage.getWidth(),
		last_w = 0;

	for (var f_id in fam_placements){
		var pack = fam_placements[f_id];

		var	group = pack[0],
			pos = pack[1],
			w = pack[2],
			h = pack[3],
			title_pos = pack[4]


		var new_x = start_x - pos.x.min;

		group.setX( new_x );
		group.setY( start_y );

		group.hit = function(res){
			console.log("HIT", res);
		}

		if (start_x + w > 500){
			start_x = 10;
			start_y = h + nodeSize*2;
		}

		start_x += w + nodeSize*4;

		group.add( new Kinetic.Rect({
			x:pos.x.min,
			y:0,
			stroke:"red",
			strokeWidth: 2,
			width: w,
			height: h + pos.y.min
		}));


		last_w = w;
	}
}
*/
