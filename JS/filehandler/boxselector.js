var fileSelector = {

  __initialised: false,

  _container: document.getElementById('filebox'),
  _div: document.getElementById('fileselector'),
  _close: document.getElementById("filebox_close"),

  _boxpref: "box_",
  _subpref: "submit_",
  _haplosuff: "_haplo",
  _mapsuff: "_map",

  formats: { // must match option values
    "allegro": "allegro",
    "genehunter": "ghm",
    "simwalk": "sw",
    "merlin": "merlin",
    "null":"null"
  },
  // Song 9 week 7
  _getBox(progname) {
    return document.getElementById(fileSelector._boxpref + progname);
  },

  _getHaplo(progname) {
    return document.getElementById(progname + fileSelector._haplosuff);
  },

  _getMap(progname) {
    return document.getElementById(progname + fileSelector._mapsuff);
  },

  _getSubmit(progname){
    return document.getElementById(fileSelector._subpref + progname);
  },

  _initSubmits(){
    for (var format in fileSelector.formats){
      var val = fileSelector.formats[format],
          submit = fileSelector._getSubmit(val);


      if (format in init.haploview){
        submit.onclick = init.haploview[format];       
      }
    }
  },


  selectProg(progname) {
    for (var format in fileSelector.formats) {
      var value = fileSelector.formats[format];
      if (format === progname) {
        fileSelector._getBox(value).style.display = "";
      } else {
        fileSelector._getBox(value).style.display = "none";
      }
    }
  },

  init() {
    utility.showBG();
    fileSelector._container.style.display = "block"

    fileSelector._div.focus();


    if (!fileSelector.__initialised)
    {
      function change() {
        fileSelector.selectProg(this.value);
      };

      fileSelector._div.onchange = change;
      fileSelector._div.onkeyup = change;

      fileSelector._close.onclick = fileSelector.end;

      fileSelector._initSubmits();
      

      fileSelector.__initialised = true;
    }

    fileSelector.selectProg(fileSelector._div.value);
  },

  end(){
    utility.hideBG();
    fileSelector._container.style.display = "none";
  }
}
