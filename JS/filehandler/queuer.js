

class PromiseQueue {

	constructor(jobfunc){
		this.promise = Promise.resolve();
		this.generaltask = jobfunc;
	}


	addJob(job){
		console.log("---Queuing:", job.file.name)

		var that = this;

		this.promise = this.promise.then(function(){
			console.log("---Dispatching:", job.file.name);
			return that.generaltask(job);
		});
	}


	// general task, as set externally to constructor
	static pFileRead(fileprops){
		var file = fileprops.file,
			task = fileprops.task,
			type = fileprops.type,
			fed_data = fileprops.fed_data || false;

		return new Promise((resolve, reject) => {

			if (fed_data){
				//console.log("")
				try {
					task(fed_data)
					resolve();
				} catch (e) {
					console.log("error", e);
					reject("Generated data failed to process")
				}
			}

			else {
				var fr = new FileReader();

				fr.onload = function(e){
					try {
			    		task(e.target.result);
		    			resolve();

		    		} catch(e){
		    			reject(file.name + " is not a " + type + ", and " + e);
		    		}
		    	}
				fr.readAsText(file);
			}
		});
	}


	exec(finishfunc)
	{
		this.promise.then( finishfunc ).catch(
			function(errors){

				if (BenchStopwatch.__timeStart !== null ){
					BenchStopwatch.terminate();
				}
				utility.notify("Check your inputs", errors, 5);

				setTimeout(function(){
					MainButtonActions.exitToMenu();
				}, 5000);
			}
		);
	}
}




// Works, but convoluted

/*
class PromiseQueue_eski {

	//https://jsfiddle.net/Lsobypup/

	constructor(jobfunc){
		this.jobs = [];
		this.async_task = jobfunc;
	}


	addJob(job){


		console.log("---Queuing:", job.file.name)

		var p1 = job;
		this.jobs.push(p1);
	}



	static pFileRead(file, task){
		return new Promise((resolve, reject) => {
			var fr = new FileReader();

			fr.onload = function(e){
	    		task(e.target.result);
	    		resolve();
	    	}
			fr.readAsText(file);
		});
	}


	exec(finishfunc)
	{
		var inputs = this.jobs;
		var promise = Promise.resolve();

		inputs.map(
			file_and_task => promise = promise.then(
				() => PromiseQueue.pFileRead(file_and_task.file, file_and_task.task)
			)
		);

		promise.then( finishfunc );
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
	    	return 0;
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
}*/
