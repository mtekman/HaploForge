#!/usr/bin/env python2

import sys, math
from scipy import misc,ndimage
import numpy as np

if len(sys.argv) != 3:
	print >> sys.stderr, '''Produces an 8-bit bgr(a) image out of text
	%s <textfile> <dimensions>
''' % sys.argv[0].split('/')[-1]
	exit(-1)


min=9999
max=0

script_file=sys.argv[1]
dimensions=int(sys.argv[2])

if dimensions == 3:print "Making BGR"
elif dimensions == 4:print "Making BGRA"
else:
	print "Either specify 3 or 4 dimensions"
	exit(-1)


data=[]

running_index=0
nl_ch = 10;			# newline_char

pixel = [ nl_ch for x in xrange(dimensions)]

for line in open(script_file,'r'):

	for c in line:
		cv = ord(c)
		
		if cv>max:max=cv
		if cv<min:min=cv

		pixel[running_index%dimensions]=cv
		

		if running_index%dimensions==(dimensions-1):
			data.append(pixel)
			pixel = [ nl_ch for x in xrange(dimensions)]
			

		running_index += 1

data.append(pixel)

dim = int(math.sqrt(len(data)))+1
diff = (dim*dim) - len(data)

print "\tTotal char:", len(data)
print "\tRough dims:", dim,'x',dim, '=', dim*dim
print "\tMin,Max Px:", min, max

pixel = [ nl_ch for x in xrange(dimensions)]
for d in xrange(diff):
	data.append(pixel)


x = np.array(data)
x.shape = (dim,dim, dimensions)

img = misc.toimage(x, high=np.max(x), low=np.min(x))
img.save("my_code.png")

# DEBUG
#rd = misc.imread("my_code.png")
#import code; code.interact(local=locals())
