#!/bin/bash

outdir=$1

root="../../"

[ "$outdir" = "" ] && echo "`basename $0` <outdir>" && exit -1

[ -e $outdir ] && echo "$outdir already exists" && exit -1

mkdir -p $outdir

JS_file=$outdir/total.js
cat ./disclaimer.txt > $JS_file

# HTML JS
for f in `find $root/HTML -type f -name "*.html"`; do
	[ "`basename $f`" = "code_includes.html" ] && continue

	cat $f >> $JS_file
	echo "" >> $JS_file
done

cat $root/JS/__frameworks/kinetic-v5.1.0.min* >> $JS_file

# JS
#for f in `find ./JS -type f -name "*.js"`; do
for f in `grep -oP "(?<=(src=\"))[^\"]*" $root/HTML/code_includes.html`; do 
#	dir=$outdir/`dirname $f`
#	mkdir -p $dir
#	cat disclaimer.txt $f > $dir/`basename $f`

	[[ "$f" =~ "__" ]] && continue

	cat $root/$f >> $JS_file
	echo "" >> $JS_file
done

#imbin="__assets/__obfuscate/to_image.py"
#$imbin $JS_file $outdir/logo.png


# Copy over essentials
mkdir -p $outdir/public_assets/
cp $root/favicon.ico $outdir
cp -r $root/public_assets/styles $outdir/public_assets/
cp -r $root/public_assets/images $outdir/public_assets/
cp -r $root/public_assets/videos $outdir/public_assets/

cat $root/index.html | grep -v "<script src=" > tmp.txt

#cat tmp.txt\
# | sed "s|<!-- CODE GOES HERE -->|<script src=\"`basename $JS_file`\" ></script>|"\
# > $outdir/index.html

cat tmp.txt\
 | sed "s|<!-- CODE GOES HERE -->|<script src=\"`basename $JS_file`\" ></script>|"\
 > $outdir/index.html

rm tmp.txt 

# Copy test assets (7z archive)
mkdir -p $outdir/test/
cp $root/public_assets/resources/test/supplemental_*.7z  $outdir/test/
