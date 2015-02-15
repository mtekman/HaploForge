
/*
First pass -- gives unique_graph_obs initial coords based on
              generation_grid_ids ordering
*/
function graphInitPos(start_x, start_y){
    // Descending down the generations.
    // Main founders are at top

    var y_pos = start_y;

    // Init Nodes
    for (var gen=0; gen < generation_grid_ids.length; gen++){
        var x_pos = start_x;

        for (var p=0; p < generation_grid_ids[gen].length; p++)
        {
            var pers_id  = generation_grid_ids[gen][p],
                nodepers = unique_graph_objs[pers_id];

            //Mother and Father already set? Center from there
            try{
                var moth = unique_graph_objs[nodepers.mother.id],
                    fath = unique_graph_objs[nodepers.father.id];

                if (moth.center_pos[0] != -1 && fath.center_pos[0] != -1)
                    x_pos = Math.floor((moth.center_pos[0] + fath.center_pos[0])/2);

            } catch (e){}

            nodepers.center_pos = [x_pos, y_pos];
            x_pos += horiz_space;
        }
        y_pos += vert_space + 25;
    }

    // Init Edges
    for (var go in unique_graph_objs){
        var obj = unique_graph_objs[go];

        if (obj instanceof Edge)
        {
            switch(obj.type){
                    case 0: //Mateline
                        obj.start_pos = unique_graph_objs[obj.start_join_id].center_pos;
                        obj.end_pos = unique_graph_objs[obj.end_join_id].center_pos;
                        break;

                    case 1: //ParentLine
                         var mateline = unique_graph_objs[obj.start_join_id];
                         obj.start_pos = [ Math.floor(                              // center of X's
                                            (mateline.start_pos[0] + mateline.end_pos[0])/2
                                         ),  mateline.start_pos[1] ];
                         obj.end_pos = [obj.start_pos[0], obj.start_pos[1] + vert_space];
                        break;

                    case 2: //ChildLine
                        obj.start_pos = [
							unique_graph_objs[obj.start_join_id].start_pos[0],
							unique_graph_objs[obj.start_join_id].start_pos[1] + vert_space ]
                        obj.end_pos = unique_graph_objs[obj.end_join_id].center_pos;
                        break;

                    default:
                        assert(false,"Wrong type!");
            }
        }
    }
}


function drawGraph()
{
    for (var go in unique_graph_objs){
         var obj = unique_graph_objs[go];

         if (obj instanceof Edge)
             drawRLine(obj.start_pos, obj.end_pos);
    }


    for (var go in unique_graph_objs){
         var obj = unique_graph_objs[go];

         if (obj instanceof NodePerson)
             drawPerson(obj.center_pos, obj.person.id,
                        obj.person.gender, obj.person.affected);
    }
}
