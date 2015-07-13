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


def encodeAll(image_data, operations, debug=False):

	# flip vertical/horizontal/diagonal
	# shift +/-n
	# add +/-g 
	for o in operations:
		if o.startswith("flip"):
			orientation = o.split()[1].strip();

			if orientation == "vertical":
				image_data = np.flipud(image_data)
			
			elif orientation == "diagonal":

				for row in xrange(len(image_data)):
					for col in xrange(row,len(image_data[0])):
						temp = image_data[row][col]
						image_data[row][col] = image_data[col][row]
						image_data[col][row] = temp


			else:			# horizontal
				image_data = np.fliplr(image_data)


		elif o.startswith("shift"):
			offset = int(o.split()[1].strip())
			image_data = np.roll(image_data, offset)

		elif o.startswith("add"):
			value = int(o.split()[1].strip())
			image_data += value
#			image_data %= 255

		if debug:
			print "\n\t", o
			print image_data
	return image_data


#x = np.arange(27)
#x *= (255/27)
#x.shape = (3,3,3)

#print x
#x = encodeAll(x, ["flip diagonal", "add -77", "shift 2", "flip vertical"])
#print "\n\nAND reverse"
#x = encodeAll(x, ["flip vertical", "shift -2", "add 77", "flip diagonal"])
#exit(-1)


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

#ops = ["flip diagonal", "add -77", "shift 2", "flip vertical"]
ops = ["flip horizontal"]
x = encodeAll(x, ops)

img = misc.toimage(x, high=np.max(x), low=np.min(x))
img.save("logo.png")

# DEBUG
#rd = misc.imread("my_code.png")
#import code; code.interact(local=locals())
