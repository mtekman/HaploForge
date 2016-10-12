

class PromiseQueue {

	constructor(jobfunc){
		this.async_task = function(job){
			jobfunc(job);
			console.log("---Processing:", job.file.name);
		}
	}

	
	addJob(job){
		if (this.lastjob === undefined){
			this.lastjob = Promise.resolve();
		}

		console.log("---Queuing:", job.file.name)
		this.lastjob.then(new Promise(function(resolve,reject)
		{
			this.async_task(job);
			resolve(); 
			//run next job set by then
		}));
	},

	exec(finishfunc){
		this.lastjob
	}

}


var Queuer = {

	addReadJob(job) {
	    console.log("---Queuing:", job.file.name);

	    if (this.firstjob === undefined) {
	            this.firstjob = function(){};
	            this.triggerjobs = false;
	    }

	    // Run jobs immediately if trigger pulled
	    if (this.triggerjobs){
	    	FileFormat.readFile(job.file, function(text){
	    		job.task(text);
	    		console.log(familyMapOps.getRandomPerc())
	    		console.log("---Triggered", job.file.name);
	    	});
	    	return 0;
	    }

        // Otherwise  - store previous job 
	    var lastjob = this.firstjob;

	    // Create new job that passes the previous job
	    // as a readbeforefunc argument to new job.
	    this.firstjob = function(finish){
	        lastjob();
	        FileFormat.readFile(job.file, function(text){
	           	job.task(text)
	          	console.log("---Processing:", job.file.name)
	    	}, finish);
	   	}
	},

	exec(finishfunc){
		this.readjob(finishfunc);
	}
}