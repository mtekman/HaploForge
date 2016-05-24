
class PersistData {

	static toPedfileString(store_graphics=false){

		var text = "";

		for (var fid in family_map){

			for (var pid in family_map[fid]){

				var perc =  familyMapOps.getPerc(pid, fid);
				var array = [fid, perc.id, perc.father.id || 0, perc.mother.id || 0, perc.gender, perc.affected]

				if (store_graphics){
					var gfx = uniqueGraphOps.getNode(pid, fid);

					if (gfx===-1){
						console.log("Error", pid, fid, "does not have any graphics..")
						continue;
					}

					var meta = gfx.graphics.getPosition();
					meta.name = perc.name

					array.push( "//", JSON.stringify(meta));
				}

				text += "\n"+ array.join('\t');
			}
		}
		return text;
	}

}