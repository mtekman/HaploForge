#!/bin/bash

inp=$1
[ "$inp" = "" ] && echo "`basename $0` <input.mp4>" && exit -1

ffmpeg -i $inp -vf scale=iw/2:-1 `basename $inp .mp4`.post.mp4
