

class PromiseQueue {

	constructor(jobfunc){
		this.jobs = [];

		this.async_task = function(job){
			console.log("---Processing:", job.file.name);
			jobfunc(job);
		}
	}

	
	addJob(job){
		console.log("---Queuing:", job.file.name)

		var that = this;

		this.jobs.push(new Promise(function(resolve,reject)
		{
			that.async_task(job);
			resolve();  			//run next job set by then
		}));
	}


	exec(finishfunc)
	{
		this.jobs.reduce(function(c,n){
			return c.then(n);
		}, Promise.resolve())
		.then(new Promise(function(c,b){
			finishfunc();
		}));
	}
}



class Queue2 {

	constructor(task){
		this.activejobs = [];
		this.jobtask = task;
		this.run = null;
	}

	addJob(job){
		console.log("---Queuing2:", job.file.name);
		this.activejobs.push( job );
	}

	exec1(finish){
		//Try launching them one after the other
		for (var f=0; f < this.activejobs.length; f++)
		{
			var job = this.activejobs[f];
			console.log("---Processing", job.file.name )
			Queue2.readFile( job );
		}
		finish();
	}

	rchain(finish)
	{
		if (this.activejobs.length == 0){
			finish();
			return 0
		}
		
		var job = this.activejobs.pop();
		console.log("THINK", job.file.name);
		this.jobtask( job, this.rchain(finish))
	}

	exec3(finish)
	{
		this.activejobs = this.activejobs.reverse();
		this.rchain(finish);
	}

	exec2(finish){

		var that = this;
		var nextjob = finish;
		for (var f = this.activejobs.length -1; f >=0; f--)
		{
			var job = this.activejobs[f];

			bind(this.run, function(){
				console.log("---Processing", job.file.name )
				that.jobtask( job, nextjob );
			});

			that.run = this.run;
			nextjob = that.run;
		}

		this.run();

	}

	static readFile(fac){
	    var fr = new FileReader();

	    fr.onloadend = function(e){
	    	fac.task(e.target.result);
    	};

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