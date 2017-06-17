var BenchMark = {
    __timeStart : null,
    __timeEnd   : null,
    __diff      : null,
    __callback  : null,

    /*_records : [],
    _record_names : [],*/
   
    start : function(callback = null){
        BenchMark.__diff = null;
        BenchMark.__callback = callback;
        BenchMark.__timeStart = performance.now();

    },

    stop : function(){
        BenchMark.__timeEnd = performance.now();
        BenchMark._logDiff();
    },

    terminate : function(){}, // To be swapped in for a custom one upon failure

    _resetTimes : function(){
        BenchMark.__timeStart = null;
        BenchMark.__timeEnd   = null;
        BenchMark.__callback  = null
        //BenchMark.__diff = null;
    },

    _logDiff : function(){
        var d = BenchMark.__timeEnd - BenchMark.__timeStart;
        BenchMark.__diff =  d;

        if (BenchMark.__callback !== null){
            BenchMark.__callback(d)
        }

        BenchMark._resetTimes();
    },

    getDiff: function(){
        return BenchMark.__diff;
    },

    record(text){
        let key = "benchrecords";

        if (localStorage.getItem(key) === null){
            localStorage.setItem(key, "Tree Generation:\tRootFounders\tMaxGen\tAlleleSize\tInbreedChance\tNumPeople\tNumInbredCouples\tTimingTreeGen\tTimingRender\n")
        }

        var tttt = localStorage.getItem(key)
        tttt += text;

        localStorage.setItem(key, tttt);
        console.log("logged:", text);
    },

    exportData(){
        exportToTab( localStorage.getItem("benchrecords") );
    },

    launch_with_props(rootfounders,maxgen, allelesize, inbreedchance, exportToFile){
        let outtab    = "              \t" + rootfounders + "\t" + maxgen + "\t" + allelesize + "\t" + inbreedchance;

        BenchMark.terminate = function(){
            BenchMark.record(outtab + "\tTERMINATED\n");
        }


        BenchMark.start();
        var tg = new TreeGenerator(rootfounders, maxgen, allelesize, inbreedchance);
        BenchMark.stop();

        let diff = BenchMark.getDiff();

        let metrics = tg.printmetrics();
        outtab     += "\t" + metrics.numpeople + "\t" + metrics.numinbredcouples + "\t" + diff

        
        //console.log("Generated in", 
        //    "accurate to", -(performance.now() - performance.now()), "ms\n",
        //    "
        let text = tg.exportToHaploFile();

        if (exportToFile){
            exportToTab( text );
        }


        // Completed in FileFormat_superclass.js
        BenchMark.start(function(diff){
            outtab += "\t" + diff + "\n"
            BenchMark.record(outtab);
        }); 
        new Allegro(null, text);    
    },

    launch_display(){
        benchProps.display(function(rootfounders, maxgen, allelesize, inbreedchance, exportToFile)
        {
            BenchMark.launch_with_props( rootfounders, maxgen, allelesize, inbreedchance, exportToFile);
        });
    }
}