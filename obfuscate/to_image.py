#!/usr/bin/env python2

import sys
import math

script_file=sys.argv[1]



array = [];
min=9999999
max=0

for line in open(script_file,'r'):
	for chr in line:
		cv = ord(chr)
		if min>cv:min=cv
		if max<cv:max=cv
		array.append( cv )



print min,max
print len(array)
print  math.sqrt( len(array)/4 )


# Can definitely store data as 7-bit if needed (though 8-bit is standard)
