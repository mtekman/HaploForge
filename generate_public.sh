#!/bin/bash

outdir=$1

[ "$outdir" = "" ] && echo "`basename $0` <outdir>" && exit -1

mkdir -p $outdir

JS_file=$outdir/total.js
cat disclaimer.txt $f > $JS_file

# HTML JS
for f in `find ./HTML -type f -name "*.html"`; do
#	dir=$outdir/`dirname $f`
#	mkdir -p $dir
#	cat disclaimer.txt $f > $dir/`basename $f`

	[ "`basename $f`" = "code_includes.html" ] && continue

	cat $f >> $JS_file
	echo "" >> $JS_file
done


cat JS/__frameworks/kinetic-v5.1.0.min* >> $JS_file

# JS
for f in `find ./JS -type f -name "*.js"`; do
#	dir=$outdir/`dirname $f`
#	mkdir -p $dir
#	cat disclaimer.txt $f > $dir/`basename $f`

	[[ "$f" =~ "__" ]] && continue

	cat $f >> $JS_file
	echo "" >> $JS_file
done

# Copy over essentials
cp -r favicon.ico styles $outdir

cat index.html | grep -v "<script src=" > tmp.txt

cat tmp.txt\
 | sed "s|<!-- CODE GOES HERE -->|<script src=\"`basename $JS_file`\" ></script>|"\
 > $outdir/index.html

rm tmp.txt
