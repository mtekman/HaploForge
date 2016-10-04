#!/bin/bash

echo "<html><head></head><body>"

for f in `find ./ -type f`; do 
	echo "<a href=$f>`basename $f`</a><br/>"
done;

echo "</body></html>"
