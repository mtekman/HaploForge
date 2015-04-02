
// function debugconsole(condition){
// 	if (condition)
// 		for (var a=1; a < arguments.length; a++)
// 			console.log(arguments[a]);
// }


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
	var exploring_routes = [{array:[],numsets:0}]; 		// initial zero route
	var route_map = {}; // routes explored already

	var num_cycles = 0;

	while (true)
	{
		//Sort current open routes, and take the top batch
		// discarding the rest
		exploring_routes = exploring_routes.sort(function (a,b){ return b.array.length - a.array.length;}).slice(0,MAX_ROUTES);

		// Happens after the splice and sort
		if (exploring_routes[0].array.length === array.length){
			break;
		}

		console.log("routes="+exploring_routes.map(function (n){ return "["+n.array+":"+n.numsets+"] "}));

		if (num_cycles ++ > 10){
			console.log(num_cycles);
			break;
		}

		var num_routes_now = exploring_routes.length;

		for (var e=0; e < num_routes_now; e++)
		{
			// Current open route
			var current_route = exploring_routes[e].array,
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
				var stretch = current_row+1;
				while ( stretch < end )
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
				console.log("    - stretches for ",stretch - current_row, "until index", stretch);

				// Store color with key as the length of the stretch
				ordered_routes[ stretch - current_row ] = current_color;
			}
			var keys_rev_ord = Object.keys(ordered_routes).sort(function(a,b){return b-a});


			console.log("    ordered_routes=", ordered_routes);
			console.log("    reversed_order=", keys_rev_ord);

			// Add routes to current route
			for (var k=0; k < keys_rev_ord.length; k++){

				var key = keys_rev_ord[k],
					new_r = current_route.slice(); 			//clone a new path for each fork

				var len = key;
				while(len --> 0)
					new_r.push(  ordered_routes[key] ); 	// push the color k times

				console.log("   - adding '"+ordered_routes[key]+"' "+key+"x  to ", new_r);

				//Add the zeros
				//  				for (var z_index in zero_indexes){
				// 					if (new_r.length > z_index)
				// 	 					new_r[ z_index ] = zero_color_grp;
				//  				}

				var string_key = new_r.reduce( function(a,b){ return a+""+b;});

				if (!(string_key in route_map)){
					route_map[string_key] = 0;
					exploring_routes.push({array:new_r, numsets:0}); 			// push the new path if unique
				}
			}
			console.log("    explored="+exploring_routes.map(function (n){ return "["+n+"] "}));
			console.log("    on "+e+"/"+num_routes_now);
		}
		console.log("next iter");
	}
	var best = exploring_routes[0].array;

	var unique = best.filter(function(item,i,ar){
		return (item.color_group[0] !== zero_color_grp  && ar.indexOf(item.color_group[0]) === i);
	});


	console.log("best_routes A*", exploring_routes);
	console.log(" with best=", best);
	console.log(" unique=", unique);
	console.log("  in "+num_cycles+" cycles");

	console.log("SRC ARRAY=",array.map(function (a){return ""+a.color_group+"";}));

	return [best, unique];
}

var a_star_bestfirst = new Function('array','exclude_list',a_star_bestfirst__DEBUG.toString().replace(/\n\s+console\.log.*;/g,""));
