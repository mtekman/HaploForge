//TODO: Parent haplotypes should be resolved before handling child
// 		Feed parent haplotypes (mother father) as seperate exclusion lists


function debugconsole(condition){
	if (condition)
		for (var a=1; a < arguments.length; a++)
			console.log(arguments[a]);
}


var a_star_bestfirst__DEBUG = function(array, exclude_list)
{
	// Define excludelist function
	var inExcludeList;

	if (exclude_list === undefined || exclude_list.length === 0)					// No list given
		inExcludeList = function (item){return false;};

	else if ( (typeof exclude_list) === 'number')									// Single item given
		inExcludeList = function (item){ return item === exclude_list;};

	else if (exclude_list.length === 1){ 											// Single array item
		exclude_list = exclude_list[0];
		inExcludeList = function (item){ return item === exclude_list;};
	}

	else 								 											// Whole list given
		inExcludeList = function (item){ return (exclude_list.indexOf(item) !== -1);};



	var end = array.length -1;


	var MAX_ROUTES = 4;    // maximum amount of working routes

	var exploring_routes = [{array:[],numsets:0}],	// initial zero route
		complete_routes = [];

	var route_map = {}; // routes explored already

	var num_cycles = 0;

	// Initially discard any colors that stretch only for a single index
	var stretches_only = true;


	while (true){

		while (exploring_routes.length !== 0)
		{
			num_cycles ++;
			exploring_routes = exploring_routes.sort(function (a,b){ return b.array.length - a.array.length;}).slice(0,MAX_ROUTES);

			// Current open route
			var current_route = exploring_routes[0].array,
				current_nsets = exploring_routes[0].numsets,
				current_row = current_route.length;

			// Various routes at this row
			//var num_colors = iterableIndexes[current_row];
			var num_colors = array[current_row].color_group.length

			console.log("-Route:", current_route);
			console.log("    current_row=" + current_row);
			console.log("    num_colors =", num_colors);

			var ordered_routes = {},
				zero_indexes = {};

			// Look ahead by one
			for (var c=0; c< num_colors; c++){
				var current_color = array[current_row].color_group[c];

				console.log("    - trying color "+current_color);

				if (inExcludeList(current_color)){
					console.log("    - EXCLUDE!");
					continue;
				}

				//Perform look ahead
				var stretch = current_row + 1;
				while ( stretch <= end )
				{
					var new_colors = array[stretch].color_group;
					console.log("       - testing "+current_color+" against "+new_colors+" @i "+stretch);

					// Only break on another non-zero group color
					if (new_colors.length === 1){
						if (new_colors[0] === zero_color_grp)
							zero_indexes [stretch] = 0;

					}
					else if (new_colors.indexOf(current_color) === -1)
						break;

					stretch ++;
				}
				stretch -= current_row;

				console.log("    - stretches for ",stretch, "until index", stretch + current_row);

				// Store color with key as the length of the stretch
				ordered_routes[ stretch ] = current_color;
			}
			var keys_rev_ord = Object.keys(ordered_routes).sort(function(a,b){return b-a});

			console.log("    ordered_routes=", ordered_routes);
			console.log("    reversed_order=", keys_rev_ord);

			// Add routes to current route
			for (var k=0; k < keys_rev_ord.length; k++){

				var key = keys_rev_ord[k];

				// No sig. change
				if (stretches_only && key <= 1 ){
					// Dead end route
					console.log("    dead_end route, skipping");
					continue;
				}



				var new_r = current_route.slice(); 			//clone a new path for each fork

				var len = key;
				while(len --> 0)
					new_r.push(  ordered_routes[key] ); 	// push the color k times

				console.log("   - adding '"+ordered_routes[key]+"' "+key+"x  to ", new_r);

				//Add the zeros
// 				for (var z_index in zero_indexes){
//					if (new_r.length > z_index)
// 						new_r[ z_index ] = zero_color_grp;
// 				}

				var new_pack = {array: new_r, numsets:current_nsets+1};
				var string_key = new_r.reduce( function(a,b){ return a+""+b;});

				if (!(string_key in route_map)){
					route_map[string_key] = 0;
					if (new_r.length === array.length)
						complete_routes.push( new_pack ); // fin
					else
						exploring_routes.push( new_pack ); // push the new path if unique
				}
			}

			// Remove old route (now expanded)
			exploring_routes.splice(0,1);

			console.log("    explored="+exploring_routes.map(function (n){ return "["+n.array+"] "}));
			console.log("    complete="+complete_routes.map(function (n){ return "["+n.array+"] "}));
		}

		// Do we have results?
		if (complete_routes.length === 0){
			if (stretches_only){
				stretches_only = false; 	// Next iter on array tries for single indexes
				console.log("repeating without stretches");
				exploring_routes = [{array:[],numsets:0}];	// initial zero route
				continue;
			}

			console.error(arguments);
			throw new Error("No match at all!");
		}
		break;
	}

 	var best;
 	if (complete_routes.length === 1) best = complete_routes[0].array;
 	else
 		best = complete_routes.sort( function (a,b) { return a.numsets - b.numsets;})[0].array;

	var unique = best.filter(function(item,i,ar){
		return (item !== zero_color_grp  && ar.indexOf(item) === i);
	});


	console.log("best_routes A*", complete_routes);
	console.log(" with best=", best);
	console.log(" unique=", unique);
	console.log("  in "+num_cycles+" cycles");

	console.log("SRC ARRAY=",array.map(function (a){return ""+a.color_group+"";}));

	return [best, unique];
}

var strre = a_star_bestfirst__DEBUG.toString()
	.replace(/\n\s+console\.log.*;/g,"")
	.replace(/}$/,"")
	.replace("function (array, exclude_list)\n{\n","");

// strre = strre.substr(0,100);
// console.log(strre);

var a_star_bestfirst = new Function(
	'array',
	'exclude_list',
	strre
);

var	array = [
	{color_group: [4,2,6]},
	{color_group: [2,6]},
	{color_group: [2,7]},
	{color_group: [7]},
	{color_group: [4,7]},
	{color_group: [3,7]}];
a_star_bestfirst__DEBUG(array,[]);
