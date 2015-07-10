#!/bin/bash
root_dir=`readlink -f ../`

index_file=$root_dir/index.html
css_file=$root_dir/main.css

# Put all js in a single file
all_js="all_scripts.js"
echo "" > $all_js

js_files=$(grep "script" $index_file | awk -F '"' '{print $2}' | grep -v framework) 
kinetic_insert=$(grep "framework" $index_file | sed "s/JS/..\/JS/" )

for js_file in $js_files; do
	echo $js_file
	cat $root_dir/$js_file  >> $all_js
done;

#exit

# obfuscate javascript here
echo -n "Picturifying...""`./to_image.py $all_js 3`";echo "X"	# creates my_code.png


# Place all non-js into a new index file
new_index="index.html"
echo "$(grep -v script $index_file | grep -v link )" > $new_index

# Replace with css and javascript
style_data="<style>
`cat $css_file`
</style>"

tmp_index="tmp_index.html"
echo "" > $tmp_index

while read line; do
	echo "$line" >> $tmp_index

	if [[ "$line" =~ "<h1>" ]]; then
		echo "$style_data" >> $tmp_index

	elif [[ "$line" =~ "<!-- CODE GOES HERE" ]]; then
		echo "$kinetic_insert" >> $tmp_index
		echo "
<script id='garble'></script>
<div id='delete'>
	<img id='cc' src='my_code.png'></img>
	<canvas id='img_canv'></canvas>

<script>
window.onload = function(){

var i = document.getElementById('cc'),
    i_w = i.width,
    i_h = i.height,
    canvas = document.getElementById('img_canv'),
    ctx = canvas.getContext('2d');

canvas.width = i_w;
canvas.height = i_h;

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

document.getElementById('garble').innerHTML = new_script;
document.getElementById('delete').innerHTML = ' ';
}
</script>
</div>" >>  $tmp_index

	fi
done<$new_index

# Update
mv $tmp_index $new_index
