#!/usr/bin/env python2

import sys, math
from random import randint
from scipy import misc,ndimage
import numpy as np

if len(sys.argv) != 2:
	print >> sys.stderr, '''Produces an 8-bit rgb png out of text (alpha is garbled)
	%s <textfile>
''' % sys.argv[0].split('/')[-1]
	exit(-1)

script_file=sys.argv[1]
dimensions=4


def basic_encoder(value):
	if value >= 83 and value <=209:
		return int( ((value*2)-420) % 255 )

	if value >= 210:
		return value ^ 161
#
#		return int(  ((value - 105)*2 )%255  )

	return 0



def basic_decoder(value):

	if value >=64  and value <= 127:
		return value ^ 161

	return int( (((value + 255)+420)/2) % 255 )



for start_val in xrange(255):
	end_val = basic_encoder(start_val)
	pre_val = basic_decoder(end_val)

	print "%d --> %d --> %d == %s" % (
start_val, end_val, pre_val, 
"X" if (start_val==pre_val) else "")

exit(-1)


def encodeAll(image_data):
	# 
	# 
	for row in xrange(len(image_data)):
		for pix in xrange(4):
			x[row][row][pix] *= 2 
			x[row][row][pix] -= 255


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

				x = np.empty(( len(image_data[0]), len(image_data), dimensions) )

				for row in xrange(len(image_data)):
				    for col in xrange(row,len(image_data[0])):
				        x[col][row] = image_data[row][col]
    				    x[row][col] = image_data[col][row]
	
				image_data = x

			else:			# horizontal
				image_data = np.fliplr(image_data)


		elif o.startswith("shift"):
			offset = int(o.split()[1].strip())
			image_data = np.roll(image_data, offset)

# Read/Write values differ
#		elif o.startswith("add"):
#			value = int(o.split()[1].strip())
#
#			for row in xrange(len(image_data)):
#			    for col in xrange(len(image_data[0])):
#			    	for pix in xrange(dimensions-1 ): # do not alter alpha
#  					    image_data[row][col][pix] += value
# 					    image_data[row][col][pix] = image_data[row][col][pix]%255

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


nl_ch = 10;			# newline_char

# Initial buffer needed to set the colorspace between [0,255]
data=[
[47,42,255,255],
[0,42,47,255],
[nl_ch,nl_ch,nl_ch,255]] # /*\0*/



pixel = [ nl_ch for x in xrange(dimensions)]

with open(script_file,'r') as f:
	running_index=0

	while True:

		c = f.read(1);
		if not c:
			break # EOF

		cv = ord(c)
		rgb = running_index%(dimensions-1);

		pixel[rgb] = cv	# Script data is in rgb only

		if rgb == 2:

# Okay, so ideally alpha should be random and that should be that. But webkit 
# browsers have this weird issue where the rgb values are changed whenever the alpha 
# is changed too -- resulting in unpredictable behaviour.... more here:
#   http://stackoverflow.com/questions/22384423/canvas-corrupts-rgb-when-alpha-0

			pixel[3] = 255 #randint(0,255)

			data.append(pixel)
			pixel = [ nl_ch for x in xrange(dimensions)]

		running_index += 1

data.append(pixel)

dim = int(math.sqrt(len(data)))+1
diff = (dim*dim) - len(data)

print "\tTotal char:", len(data)
print "\tRough dims:", dim,'x',dim, '=', dim*dim
print "\tMin,Max Px:", np.min(data), np.max(data)

# Reshape to square
pixel = [ nl_ch for x in xrange(dimensions)]
for d in xrange(diff):
	data.append(pixel)


x = np.array(data)
x.shape = (dim,dim, dimensions)
#x.dtype='uint8'

ops = ["flip vertical"]

x = encodeAll(x, ops)

img = misc.toimage(x, high=255, low=0)
img.save("logo.png")

# DEBUG
rd = misc.imread("logo.png")

print "Comparing x -> rd:"
for j in xrange(20):
	print x[0][j], rd[0][j]

#import code; code.interact(local=locals())
