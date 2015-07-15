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


diag_shift = 22
diag_xor = 247
rgb_xor = 93

column_shift_map = {
	2:[22, 17,[56,71,90]],  	# col%11=0 + 22 down, 17 right, xor R pixel by 56, G by 71 and B by 90
	23:[-7, 56,[53,45,112]],	# 
	3: [33,-90,[93,11,65]],		# 
	14: [99,-76,[31,65,2]],
	6: [-20,12,[14,15,16]],
	190: [20,12,[14,15,16]]
}

column_shift_order = sorted(column_shift_map.keys()); # Order to apply shifts

#print column_shift_order

def encodeAll2(x):
	# 
	for row in xrange(len(x)):
		for pix in xrange(3):
			x[row][row][pix] ^= diag_xor		# Xor the diagonal pix

		# Rotate diagonal
		tmp = np.copy(x[row][row])
		x[row][row] = x[(row+diag_shift)%len(x)][(row+diag_shift)%len(x)]
		x[(row+diag_shift)%len(x)][(row+diag_shift)%len(x)] = tmp

		for col in xrange(len(x[0])):
			for pix in xrange(3):
				x[row][col][pix] ^= rgb_xor	# Xor everything else (again)

			# Shuffle rows and cols
			for cmod in column_shift_order:
				if col%cmod == 0:
					row_diff = column_shift_map[cmod][0]
					col_diff = column_shift_map[cmod][1]
					xor_diff = column_shift_map[cmod][2]

					nrow = (row+row_diff) % len(x)
					ncol = (col+col_diff) % len(x[0])

					tmp = np.copy(x[row][col])
					x[row][col] = x[nrow][ncol]
					x[nrow][ncol] = tmp
					
					for pix_index in xrange(len(xor_diff)):
						x[nrow][ncol][pix_index] ^= xor_diff[pix_index]


# Javascript does this, here for reference
def decodeAll2(x):
	#
	for row in range(len(x))[::-1]:

		for col in xrange(len(x[0])):

			# Unshuffle rows and cols
			for cmod in column_shift_order[::-1]:
				if col%cmod == 0:
					row_diff = column_shift_map[cmod][0]
					col_diff = column_shift_map[cmod][1]
					xor_diff = column_shift_map[cmod][2]

					nrow = (row+row_diff) % len(x)
					ncol = (col+col_diff) % len(x[0])

					for pix_index in xrange(len(xor_diff)):
						x[nrow][ncol][pix_index] ^= xor_diff[pix_index]

					tmp = np.copy(x[nrow][ncol])
					x[nrow][ncol] = x[row][col]
					x[row][col] = tmp

			for pix in xrange(3):
				x[row][col][pix] ^= rgb_xor

		tmp = np.copy(x[(row+diag_shift)%len(x)][(row+diag_shift)%len(x)])
		x[(row+diag_shift) % len(x)][(row+diag_shift) % len(x)] = x[row][row]
		x[row][row] = tmp

		for pix in xrange(3):
			x[row][row][pix] ^= diag_xor




# ==== MAIN ====

nl_ch = 10;			# newline_char

# Initial buffer needed to set the colorspace between [0,255]
# evaluates to : /*\0*/
data=[
	[47,42,255,255],
	[0,42,47,255],
	[nl_ch,nl_ch,nl_ch,255]
] 

# Populate with real data
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

# Make Square
dim = int(math.sqrt(len(data)))+1
diff = (dim*dim) - len(data)

print "\tTotal char:", len(data)
print "\tRough dims:", dim,'x',dim, '=', dim*dim
print "\tMin,Max Px:", np.min(data), np.max(data)

# Reshape and pad
pixel = [ nl_ch for x in xrange(dimensions)]
for d in xrange(diff):
	data.append(pixel)

x = np.array(data)
x.shape = (dim,dim, dimensions)
#x.dtype='uint8'

# For debug
b = np.copy(x)

encodeAll2(x)

img = misc.toimage(x, high=255, low=0)
img.save("logo.png")



# DEBUG
def debug(verify_code=False):
	global b
	rd = misc.imread("logo.png")

	flag=False
	if not (np.array_equal(x, rd)):
		print "[ERROR] What was written != What is read"
		flag = True

	decodeAll2(rd)

	if not (np.array_equal(b,rd)):
		print "[ERROR] Decoded message != Original"
		flag = True

	if flag:
		exit(-1)

	if verify_code:
		str = ""
		for r in xrange(len(rd)):
			for c in xrange(len(rd[0])):
				j,g,b,a = rd[r][c]
				str += chr(j)+chr(g)+chr(b)
		print str

#debug()
#import code; code.interact(local=locals())