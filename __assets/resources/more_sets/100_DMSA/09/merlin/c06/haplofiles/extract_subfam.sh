#!/bin/bash


inp=$1

start=$2
end=$3

[ "$start" = "" ] && echo "`basename $0` <merlin.fam.chr> <startN> <endN>" && exit -1

out=sub_$start\_$end\.txt

head -3 $inp > $out;

length=$(( $end - $start ))

tail -n +$start $inp | head -$length >> $out;

#less -S $out
