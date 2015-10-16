#!/bin/bash

root_dir=`readlink -f ../`
tmp="tmp"
mkdir $tmp

index_file=$root_dir/index.html
css_file=$root_dir/main.css

# Put all js in a single file
all_js="$tmp/all_scripts.js"
all_obfs="$tmp/all_obfs.js"

echo "" > $all_js
echo "" > $all_obfs

src_errors="\n>>>>>>>>>>>>>> Errors/Warnings in Source <<<<<<<<<<<<<<<<<<"
src_errend=">>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<\n"

js_files=$(grep "script" $index_file | awk -F '"' '{print $2}' | grep -v framework) 
kinetic_insert=$(grep "framework" $index_file | sed 's|JS/.*/k|k|' )
kinetic_file=$(echo $kinetic_insert | egrep -o "k.*\.js")

echo $kinetic_insert
echo $kinetic_file
#exit

# First find any specific compiler errors
cd $root_dir
echo -e $src_errors
java -jar obfuscate/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS obfuscate/$kinetic_file $js_files > /dev/null
[ $? != 0 ] && echo "ABORT!" && exit -1
echo -e $src_errend
cd -

# Otherwise cat into a single file, move global 
for js_file in $js_files; do
	echo -e "\r$js_file                      "
	cat $root_dir/$js_file  >> $all_js
done;

#

# Add terminal character sequence (javascript splits off this later)
echo -e $src_errors
java -jar compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS $kinetic_file $all_js > $all_obfs
echo "//////" >> $all_obfs
echo -e $src_errend


# Encrypt code here
echo -n "Picturifying..."
./to_image.py $all_obfs
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
	if [[ "$line" =~ "[LOCAL]" ]]; then
		echo "$line" | sed 's|\[LOCAL\]||' >> $tmp_index
		continue;
	fi

	echo "$line" >> $tmp_index

	if [[ "$line" =~ "<!-- STYLE" ]]; then
		echo "$style_data" >> $tmp_index

	elif [[ "$line" =~ "<!-- CODE GOES HERE" ]]; then
		echo "$kinetic_insert" >> $tmp_index
		echo "
<!-- Site traffic  -->
<div id='google_analytics'>
	<img id='cc' src='logo.png' ></img>
	<canvas id='cd'></canvas>
</div>

<script id='google_metrics' >
`cat $all_obfs`
</script>
" >>  $tmp_index

	fi
done<$new_index

# Update
mv $tmp_index $new_index
rm -rf $tmp
