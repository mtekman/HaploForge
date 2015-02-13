
/*
First pass -- gives unique_graph_obs initial coords based on
              generation_grid_ids ordering
*/
function graphInitPos(){
    // Descending down the generations.
    // Main founders are at top
    
    var y_pos = 0;
    
    // Init Nodes
    for (var gen=0; gen < generation_grid_ids.length; gen++){
        var x_pos = 0;
        
        for (var p=0; p < generation_grid_ids[gen]; p++)
        {
            var pers_id = generation_grid_ids[gen][p],
                nodepers = unique_graph_objs[pers_id];
            
            nodepers.center_pos = [x_pos, y_pos];
            x_pos += horiz_space;            
        }        
        y_pos += vert_space;
    }
    
    // Init Edges
    for (var go in unique_graph_objs){
        var obj = unique_graph_objs[go];        
        
        if (obj instanceof Edge)
        {
            console.log("start");            
            var mateline;
            
            switch(obj.type){
                    case 0: //Mateline
                        obj.start_pos = unique_graph_objs[obj.start_join_id].center_pos;
                        obj.end_pos = unique_graph_objs[obj.end_join_id].center_pos;
                        break;
                    
                    case 1: //ParentLine
                         mateline = unique_graph_objs[obj.start_join_id];
                         console.log("fin1");
                         console.log(obj.start_join_id);
                         console.log(mateline);
                         console.log("fin2");
                         obj.start_pos = [ Math.floor(                              // center of X's
                                            (mateline.start_pos[0] + mateline.end_pos[0])/2
                                         ),  mateline.start_pos[1] ];
                         obj.end_pos = [obj.start_pos[0], obj.start_pos[1] + vert_space];
                         mateline = 0;
                        
                        break;
                    
                    case 2: //ChildLine
                        obj.start_pos = unique_graph_objs[obj.start_join_id].end_pos;
                        obj.end_pos = unique_graph_objs[obj.end_join_id].center_pos;
                        break;
                    
                    default:
                        assert(false,"Wrong type!");
            }
        }
    }
}


function drawGraph(){
    for (var go in unique_graph_objs){
        var obj = unique_graph_objs[obj];
        
        if (obj instanceof Edge) 
            drawLine(obj.start_pos, obj.end_pos);

        else if (obj instanceof NodePerson) 
            drawPerson(obj.center_pos, obj.person.id,
                       obj.person.gender, obj.person.affected);
    }    
}