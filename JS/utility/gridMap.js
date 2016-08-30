
/* Family Specific */
class GridMap {

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
		return -1;
	}

	_kidIntersection(a,b){
		var ai=0, bi=0;
		var result = new Array();

		while( ai < a.length && bi < b.length )
		{
			if      (a[ai].id < b[bi].id ){ ai++; }
			else if (a[ai].id > b[bi].id ){ bi++; }
			else /* they're equal */
			{
				result.push(a[ai]);
				ai++;
				bi++;
			}
		}
		return result;
	}

	_recurseLevels(perc, level)
	{

		if (perc === 0){
			return;
		}

		if (perc.id in this._alreadytraversed){
			return;
		}
		this._alreadytraversed[perc.id] = 1;
		//console.log(perc.id, level);
		
		// Used by init_graph
		if (this._callback1 !== 0) {this._callback1(perc);}

		if (!(level in this._map)){
			this._map[level] = [];
		}

		this._map[level].push( perc.id );

		var gm = this;

		perc.foreachmate(function(mate){
			gm._recurseLevels(mate, level);

			var kids = gm._kidIntersection(perc.children, mate.children)

			for (var k=0; k < kids.length; k++){
				gm._recurseLevels(kids[k], level + 1);
			}
		});

		// Parents
		gm._recurseLevels( perc.mother, level - 1);
		gm._recurseLevels( perc.father, level - 1);

		// Used by init_graph
		if (this._callback2 !== 0) {this._callback2(perc);}

		return;
	}
}