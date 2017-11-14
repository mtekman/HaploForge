
export default var BenchStopwatch = {
    __timeStart : null,
    __timeEnd   : null,
    __diff      : null,
    __callback  : null,

    /*_records : [],
    _record_names : [],*/

    start : function(callback = null){
        BenchStopwatch.__diff = null;
        BenchStopwatch.__callback = callback;
        BenchStopwatch.__timeStart = performance.now();

    },

    stop : function(){
    	if (BenchStopwatch.__timeStart !== null){
	        BenchStopwatch.__timeEnd = performance.now();
	        BenchStopwatch._logDiff();
	    }
    },

    terminate : function(){}, // To be swapped in for a custom one upon failure

    _resetTimes : function(){
        BenchStopwatch.__timeStart = null;
        BenchStopwatch.__timeEnd   = null;
        BenchStopwatch.__callback  = null
        //BenchMark.__diff = null;
    },

    _logDiff : function(){
        var d = BenchStopwatch.__timeEnd - BenchStopwatch.__timeStart;
        BenchStopwatch.__diff =  d;

        if (BenchStopwatch.__callback !== null){
            BenchStopwatch.__callback(d)
        }

        BenchStopwatch._resetTimes();
    },

    getDiff: function(){
        return BenchStopwatch.__diff;
    },
}
