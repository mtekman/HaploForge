var fileSelector = {

  _container: document.getElementById('filebox'),
  _div: document.getElementById('fileselector'),

  _boxpref: "box_",
  _haplosuff: "_haplo",
  _mapsuff: "_map",

  formats: { // must match option values
    "allegro": "allegro",
    "genehunter": "ghm",
    "simwalk": "sw",
    "merlin": "merlin"
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
    document.getElementById('maincircle').style.display = "none";

    fileSelector._div.onchange = function() {
      fileSelector.selectProg(this.value);
    };
    
    fileSelector.selectProg(fileSelector._div.value);
  }
}

setTimeout(fileSelector.init, 200);
