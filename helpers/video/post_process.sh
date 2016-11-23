#!/bin/bash

inp=$1
[ "$inp" = "" ] && echo "`basename $0` <input.mp4>" && exit -1

#ffmpeg -i $inp -c:v libx265 -vf scale=iw/2:-1 `basename $inp .mp4`.post.mp4
#ffmpeg -i $inp -c:v libx264 -vf format=yuv420p -vf scale=iw/1.5:-1 post/`basename $inp .mp4`.post.mp4
ffmpeg -i $inp -c:v libvpx -vf format=yuv420p -vf scale=iw/1.5:-1 post/`basename $inp .mp4`.post.webm
