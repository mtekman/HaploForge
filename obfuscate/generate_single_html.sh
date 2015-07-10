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

# obfuscate javascript here
tmp_js="tmp_all.js"
echo -n "Obfuscating..."
yuicompressor -v --nomunge --preserve-semi --disable-optimizations $all_js > $tmp_js 2> obfusc.log
mv $tmp_js $all_js
echo "X"
cat obfusc.log | grep "used"


# Place all non-js into a new index file
new_index="index.html"
echo "$(grep -v script $index_file | grep -v link )" > $new_index

#exit

# Replace with css and  javascript
style_data="<style>
`cat $css_file`
</style>"

script_data="<script>
`cat $all_js`
</script>"


tmp_index="tmp_index.html"
echo "" > $tmp_index

while read line; do
	echo "$line" >> $tmp_index

	if [[ "$line" =~ "<h1>" ]]; then
		echo "$style_data" >> $tmp_index

	elif [[ "$line" =~ "<!-- CODE GOES HERE" ]]; then
		echo "$kinetic_insert" >> $tmp_index
		echo "$script_data" >> $tmp_index
#	else
	fi
done<$new_index

# Update
mv $tmp_index $new_index


#sed -i "s/<h1>.*<\/h1>/$header_data/" $new_index

#less -S $new_index


