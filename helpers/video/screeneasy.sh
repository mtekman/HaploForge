#!/bin/bash

out=$1
[ "$1" = "" ] && echo "`basename $0` <outname.mp4>" && exit -1

./res.sh

ffmpeg -video_size 1014x660 -framerate 25 -f x11grab -i :0.0+4,83 $out

mpv $out
while [ $? != 0 ]; do
  mpv $out
done
