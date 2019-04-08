#!/bin/bash


root="$1" # Path to HaploForge root directory
outdir="$2" # Path to exported directory

[ "$outdir" = "" ] && echo -e "
Usage: \t`basename $0` <rootdir> <outdir>

where rootdir is the HaploForge root directory, and
      outdir is a non-existing output directory which will be hosting the webserver.

e.g. ./`basename $0` ../../../Haploforge /tmp/haplo_export

" && exit -1
[ -e $outdir ] && echo "$outdir already exists" && exit -1

mkdir -p $outdir

JS_file=$outdir/total.js
cat ./disclaimer.txt > $JS_file

echo " --- Collecting all JS ---"
for f in `find $root/HTML -type f -name "*.html"`; do
	[ "`basename $f`" = "code_includes.html" ] && continue

	cat $f >> $JS_file
	echo "" >> $JS_file
done

echo " --- Concatenating all JS into single file ---"
cat $root/JS/__frameworks/kinetic-v5.1.0.min* >> $JS_file
#for f in `find ./JS -type f -name "*.js"`; do
for f in `grep -oP "(?<=(src=\"))[^\"]*" $root/HTML/code_includes.html`; do 
#	dir=$outdir/`dirname $f`
#	mkdir -p $dir
#	cat disclaimer.txt $f > $dir/`basename $f`
	[[ "$f" =~ "__" ]] && continue

	cat $root/$f >> $JS_file
        echo -n "`basename $f` "
	echo "" >> $JS_file
done
echo ""

#imbin="__assets/__obfuscate/to_image.py"
#$imbin $JS_file $outdir/logo.png

function formatting {
    read foo
    echo $foo | sed -r "s|.*/(.*)'|\1|g" | sort | uniq | tr '\n' ' '
    echo ""
}


echo " --- Copying over essential assets ---"
mkdir -p $outdir/public_assets/
cp -v $root/favicon.ico $outdir | formatting
cp -rv $root/public_assets/styles $outdir/public_assets/ | formatting
cp -rv $root/public_assets/images $outdir/public_assets/ | formatting
cp -rv $root/public_assets/videos $outdir/public_assets/ | formatting

echo " --- Creating minimal HTML file ---"
cat $root/index.html | grep -v "<script src=" > tmp.txt

#cat tmp.txt\
# | sed "s|<!-- CODE GOES HERE -->|<script src=\"`basename $JS_file`\" ></script>|"\
# > $outdir/index.html

echo " --- Linking in total JS file ---"
cat tmp.txt\
 | sed "s|<!-- CODE GOES HERE -->|<script src=\"`basename $JS_file`\" ></script>|"\
 > $outdir/index.html

rm tmp.txt 

echo " --- Copying test assets ---"
mkdir -p $outdir/test/
cp -v $root/public_assets/resources/test/supplemental_*.7z  $outdir/test/ | formatting

echo ""
echo "Haploforge can now be served from $outdir:

e.g.
   cd $outdir
   python3 -m http.server 1234

(serves to http://127.0.0.1:1234)
"