


// JS simply wont allow this, need to just start using callbacks...
//// Asynchronous handlers
//var data_ready = {};                                // Map of bools, with the key
//                                                    // being name of the variable being waited on
//
//var waitFinished = function wait(key){                   // Function to handle asynchronous read methods
//    if (!(key in data_ready))
//        data_ready[key] = false;
//
//    if (data_ready[key] == true) return;
//
//    setTimeout(waitFinished(key), 1000);
//}

