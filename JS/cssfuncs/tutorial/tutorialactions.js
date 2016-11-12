

class TutorialActions {

	constructor( tutorialobj ){
		this._currentpage = 0;
	}


	__buttonVisibility(button, visible){
		button.style.display = visible?"block":"none";
		button.style.zIndex = visible?2:-1;
	}

	backwardVisible(vis){ this.__buttonVisibility(this.back, vis);}
	forwardVisible(vis){  this.__buttonVisibility(this.forw, vis);}
	quit(){			this.main.parentNode.removeChild( this.main ); }

	forwardPage(){
		console.log("forward caled");

		var len  = this._pages.length,
			next = this._currentpage + 1;

		this.forwardVisible(next !== len - 1) // If next page is last, hide forward
		this.backwardVisible(true);

		this._currentpage = next;
		this.__hidepage(this._currentpage - 1);
		this.__showpage(this._currentpage);
	}

	backwardPage(){
		var prev = this._currentpage - 1;

		this.backwardVisible(prev !== 0);
		this.forwardVisible(true) 

		this._currentpage = prev;
		this.__hidepage(this._currentpage + 1);
		this.__showpage(this._currentpage );
	}

	__hidepage(pageno){this.___setpage(pageno,false)};
	__showpage(pageno){this.___setpage(pageno,true)};
	___setpage(pageno, visible)
	{
		var page = this._pages[pageno];
		if (page === undefined){
			console.log("Invalid page", pageno);
			return -1
		}
		page.style.display = visible?"block":"none";
	}
}
