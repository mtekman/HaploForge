

class PromiseQueue {

	constructor(jobfunc){
		this.lastjob = Promise.resolve();

		this.async_task = function(job){
			console.log("---Processing:", job.file.name);
			jobfunc(job);
		}
	}

	
	addJob(job){

		console.log("---Queuing:", job.file.name)
		this.lastjob.then(new Promise(function(resolve,reject)
		{
			this.async_task(job);
			resolve();  			//run next job set by then
		}));
	}

	exec(finishfunc){
		this.lastjob.then(finishfunc).resolve();
	}

}



class Queue2 {

	constructor(task){
		this.activejobs = []];
		this.jobtask = task;
	}

	addJob(job){
		console.log("---Queuing2:", job.file.name);
		this.activejobs.push( job );
	}

	exec1(finish){
		//Try launching them one after the other
		for (var f=0; f  this.activejobs.length; f++)
		{
			this.jobtask( this.activejobs[f] );
		}
		finish();
	}

	exec2(finish){
		// Chain one job into the next (iterate backwards)
		var nextjob = finish;
		for (var f = this.activejobs.length -1; f >=0; f--)
		{
			this.jobtask( this.activejobs[f], nextjob)
		}

	}

	static readFile(fac, finish){
	    var fr = new FileReader();

	    fr.onloadstart = function(e){
	    	fac.task(e.target.result);
    	};

   		fr.onloadend = finish;
	    fr.readAsText(fac.file);
	}
}




class Queuer {

	constructor(task){
		this.firstjob = function(){};
		this.triggerjobs = false; // set externally
		this.jobtask = task;
	}

	addJob(job) {
	    console.log("---Queuing:", job.file.name);

	    // Run jobs immediately if trigger pulled
	    if (this.triggerjobs){
	    	this.jobtask({file:job.file, task:function(text){
	    		console.log("---Triggered", job.file.name);
	    		job.task(text);
	    	}});
	    	return 0;
	    }

        // Otherwise  - store previous job 
	    var lastjob = this.firstjob;

	    var that = this;

	    // Create new job that passes the previous job
	    // as a readbeforefunc argument to new job.
	    this.firstjob = function(finish){
	        lastjob();
	        that.jobtask({file:job.file, task:function(text){
	          	console.log("---Processing:", job.file.name)
	           	job.task(text)
	    	}}, finish);
	   	}
	}

	exec(finishfunc){
		this.firstjob(finishfunc);
	}
}