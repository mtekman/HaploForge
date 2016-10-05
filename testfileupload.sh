#!/bin/bash

xdotool mousemove 77 47 click 1;    sleep 0.5;
xdotool mousemove 317 312 click 1;  sleep $1;
xdotool mousemove 446 341 click 1;  sleep $1;
xdotool mousemove 417 446 click 1;  sleep $1;
xdotool mousemove 326 338 click 1;  sleep $1;
xdotool mousemove 614 430 click 1;  sleep $1; xdotool key space;
xdotool mousemove 320 374 click 1;  sleep $1;
xdotool mousemove 622 375 click 1;  sleep $1; xdotool key space; sleep $1;
xdotool mousemove 478 487 click 1;  sleep $1;

