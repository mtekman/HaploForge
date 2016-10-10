#!/bin/bash


function res {

xdotool mousemove  77  47 click 1;  sleep 0.5;
xdotool mousemove 317 312 click 1;  sleep $1;
xdotool mousemove 446 341 click 1;  sleep $1; 
xdotool mousemove 417 380 click 1;  sleep $1;   # allegro
xdotool mousemove 333 350 click 1;  sleep $1;
xdotool mousemove 617 311 click 1;  sleep $1; xdotool key space; sleep $1;
xdotool mousemove 324 364 click 1;  sleep $1;
xdotool mousemove 589 342 click 1;  sleep $1; xdotool key space; sleep $1;
xdotool mousemove 324 437 click 1;  sleep $1;
xdotool mousemove 586 284 click 1;  sleep $1; xdotool key space; sleep $1;

xdotool mousemove 465 475 click 1;  sleep $1;

}

res $1
