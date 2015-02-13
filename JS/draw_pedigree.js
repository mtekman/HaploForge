        
//function buildSimpleGraph(start_x, start_y) {
//    // Pick a random room individual, and build from them
//    var root;
//    
//    for (var famid in family_map){
//        var broke = false;
//        for (var id in family_map[famid]){
//            root = family_map[famid][id];
//            if (root.father == 0 && root.mother ==0 ) { broke=true;break};
//        }
//        if(broke) break;
//    }
//    
//    var person_drawn = {}               // Holds person id of already drawn indivs
//    var connection_drawn = {}           // Holds per->per string of already drawn connections
//
//    
//    function testConnection(id1, id2){
//        var c1 = [id1,id2], c2 = [id2,id1];
//        
//        if (!((c1 in connection_drawn) || (c2 in connection_drawn))){
//                connection_drawn[c1] = connection_drawn[c2] = 1;
//                return true;
//        }
//        return false;
//    }    
//    
//    //Found our root
//    //    -- recursively draw
//    var draw = function nodeDraw(x,y,pers){
//        if (pers === 0) return;
//        
//        var id = pers.id,
//            gend = pers.gender,
//            affe = pers.affected;
//        
//        
//        if (!(pers.id in person_drawn)){
//            drawPerson(x,y, id, gend, affe);
//            person_drawn[pers.id]=1;
//            console.log("Drawing: "+ pers.id);
//        }
//        else return;
//        
//        //Mates
//        for (var m =0; m < pers.mates.length; m++){
//            var mate = pers.mates[m];   
//            var new_x = x + (horiz_space*(m+1));
//            
//            if (testConnection(pers.id, mate.id))
//                drawLine(x,y, new_x, y);
//            
//
//            nodeDraw(new_x,y, mate);
//        }
//        
//        //Children
//        var child_step_width = 2*(horiz_space/pers.children.length);
//        
//        for( var c=0; c< pers.children.length; c++){
//            var child = pers.children[c];
//            
//            if (child.
//            
//            var new_x = x - horiz_space                 //starting point
//                        + (c * child_step_width),
//                new_y = y + vert_space;
//            
//            if (testConnection(pers.id, child.id))
//                drawLine(x,y, new_x, new_y);
//            
//            nodeDraw(new_x, new_y, child);        
//        }
//        
//        //Parents
//        nodeDraw(x - horiz_space, y - vert_space, pers.father);
//        nodeDraw(x + horiz_space, y - vert_space, pers.mother);
//        
//        
//        return;
//    }
//    
//    draw(start_x, start_y, root);
//}