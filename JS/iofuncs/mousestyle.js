
export var MouseStyle = {

	restoreCursor(){document.body.style.cursor = "";},

	//"url('styles/Precision.cur'),auto";
	changeToArrowCursor(){document.body.style.cursor = "crosshair";},
	changeToGrab(){document.body.style.cursor = "move";}, // grab no chrome support..
	changeToMove(){document.body.style.cursor = "move";},
	changeToPointer(){document.body.style.cursor = "pointer";},

	changeToVerticalN(){document.body.style.cursor = "n-resize";},
	changeToVerticalS(){document.body.style.cursor = "s-resize";},
}
