export default var BackgroundVidMain = {

	__source : "public_assets/videos/background_general.lesser2.webm",
	__id : "bgvid",
	__lasttime : 0,
	__instance : null,

	__makeVid(){
		var vid = document.createElement('video'),
			src = document.createElement('source');

		vid.currentTime  = BackgroundVidMain.__lasttime;
		src.src          = BackgroundVidMain.__source;
		vid.id           = BackgroundVidMain.__id;
		vid.loop         = true;
		vid.autoplay     = true;
		vid.playbackRate = 0.7;

		vid.appendChild(src);
		return vid;
	},

	addVid(){
		// Only works on MainPage, does nothing otherwise
		if (MainPageHandler._currentMode === MainPageHandler.modes.main
			&& userOpts.fancyGraphics
			&& BackgroundVidMain.__instance === null
			&& TutorialActions.getNumTutorials() == 0)
		{
			var vid = (BackgroundVidMain.__instance = BackgroundVidMain.__makeVid());
			document.body.appendChild(vid);
		}
	},

	removeVid(){
		var vid = BackgroundVidMain.__instance;

		if (vid !== null){
			vid.parentNode.removeChild(vid);
			BackgroundVidMain.__instance = null;
			BackgroundVidMain.__lasttime = vid.currentTime;
		}
	}
}
