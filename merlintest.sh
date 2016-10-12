#!/bin/bash

def=0.1
ref=1.5

function pollOpen {
  while [ "`xdotool search --name \"Open File\"`" = "" ]; do sleep 0.01; done;
}

function pollClose {
  while [ "`xdotool search --name \"Open File\"`" != "" ]; do sleep 0.01; done;
}


xdotool mousemove  72  50 click 1; sleep $ref;
xdotool mousemove 336 314 click 1; sleep $def;
#xdotool mousemove 455 342 click 1; sleep $def;

xdotool key Down
xdotool key Down
xdotool key Down
xdotool key Down
#xdotool key Return

xdotool key Tab; sleep 0.5; xdotool key Return; pollOpen; xdotool key Return; pollClose; sleep $def;
xdotool key Tab; sleep 0.5; xdotool key Return; pollOpen; xdotool key Return; pollClose; sleep $def;
xdotool key Tab; sleep 0.5; xdotool key Return; pollOpen; xdotool key Return; pollClose; sleep $def;

xdotool key Tab; sleep 0.5; xdotool key Return; pollOpen; xdotool key Tab; sleep 0.1;
xdotool key Down
xdotool key Down
xdotool key Down
xdotool key Down
xdotool key Return

pollClose;
sleep $def 
xdotool key Tab; sleep $def; xdotool key Return
