import familyMapOps from '/JS/pedigree/familymapops.js';

export var GlobalLevelGrid = {

	_map : {}, //fid --> [[gen1], [gen2]]

	clear: function(){
		GlobalLevelGrid._map = {}
	},

	insertGrid: function(fid, grid = null)
	{
		if (!(fid in GlobalLevelGrid._map)){

			if (grid === null){
				console.log("GLG: populating null grid");
				grid = GlobalLevelGrid.__populate(fid);
			}

			GlobalLevelGrid._map[fid] = grid;
			return true;
		}
		return false;
	},

	refreshGrid: function(fid){
		console.log("refreshing");
		if (!(GlobalLevelGrid.insertGrid(fid))){
			console.log("grid exists");
			GlobalLevelGrid.updateGrid(fid,
				GlobalLevelGrid.__populate(fid))
		}
	},

	updateGrid: function(fid, grid){
		console.log("GLG: update", fid);
		GlobalLevelGrid._map[fid] = grid;
	},

	exists: function(fid){
		return fid in GlobalLevelGrid._map;
	},

	getGrid: function(fid){
		if (fid in GlobalLevelGrid._map){
			return GlobalLevelGrid._map[fid];
		}
		return false;
	},

	deleteGrid: function(fid){
		if (fid in GlobalLevelGrid._map){
			delete GlobalLevelGrid._map[fid]
			return true;
		}
		return false;
	},

	__populate: function(fid, callback1 = 0, callback2 = 0){
		var root = familyMapOps.getFirst(fid);

		var level_grid = new LevelGrid(root, callback1, callback2);
		return level_grid.getGrid();
	},

	foreachfam: function(callback){
		for (var fid in GlobalLevelGrid._map){
			var grid = GlobalLevelGrid._map[fid];
			callback(grid, fid);
		}
	},

	foreachgeneration: function(fid, callback){
		var grid = GlobalLevelGrid.getGrid(fid)

		for (var g=0; g < grid.length; g++){
			var individuals = grid[g];
			callback(individuals, g);
		}
	},

	numGens: function(fid){
		var grid = GlobalLevelGrid.getGrid(fid);
		return grid.length;
	},

	getlastgeneration: function(fid){
		var grid = GlobalLevelGrid.getGrid(fid),
			last_gen = grid.length - 1;

		return grid[last_gen];
	}
}



/* Family Specific */
/*class LevelGrid {

	constructor(root_indiv, callback1 = 0, callback2 = 0)
	{
		this._map = {};
		this._alreadytraversed = {};

		this._callback1 = callback1;
		this._callback2 = callback2;

		this._recurseLevels(root_indiv, 0);
	}

	getGrid(){
		if (this._map !== {}){
			return map2orderedArray(this._map);
		}
		console.log("Grid not populated")
		return false;
	}

	_recurseLevels(perc, level)
	{
		if (perc === 0){
			return 0;
		}

		if (perc.id in this._alreadytraversed){
			return 0;
		}
		this._alreadytraversed[perc.id] = 1;
		//console.log(perc.id, level);

		// Used by init_graph
		if (this._callback1 !== 0) {this._callback1(perc);}

		if (!(level in this._map)){
			this._map[level] = [];
		}

		this._map[level].push( perc.id );

		var lg = this;

		perc.foreachmate(function(mate){
			lg._recurseLevels(mate, level);

			perc.foreachchild(mate, function(child){
				lg._recurseLevels(child, level + 1);
			});
		});

		// Parents
		this._recurseLevels( perc.mother, level - 1);
		this._recurseLevels( perc.father, level - 1);

		// Used by init_graph
		if (this._callback2 !== 0) {this._callback2(perc);}

		return 0;
	}
}*/
