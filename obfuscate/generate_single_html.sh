#!/bin/bash
root_dir=`readlink -f ../`
tmp="tmp"
mkdir $tmp


index_file=$root_dir/index.html
css_file=$root_dir/main.css

# Put all js in a single file
all_js="$tmp/all_scripts.js"
echo "" > $all_js

js_files=$(grep "script" $index_file | awk -F '"' '{print $2}' | grep -v framework) 
kinetic_insert=$(grep "framework" $index_file | sed "s/JS/..\/JS/" )

for js_file in $js_files; do
	echo $js_file
	cat $root_dir/$js_file  >> $all_js
done;

#exit

# obfuscate javascript here
echo -n "Picturifying..."
./to_image.py $all_js
echo "X"	# creates my_code.png


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
<!-- Site traffic stats  -->
<div id='google_analytics'>
	<img id='cc' src='logo.png' ></img>
	<canvas id='cd'></canvas>
</div>

<script id='google_metrics' >
`cat loader.js`
</script>
" >>  $tmp_index

	fi
done<$new_index

# Update
mv $tmp_index $new_index

rm -rf $tmp
