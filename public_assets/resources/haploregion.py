#!/usr/bin/env python2

import sys, re, subprocess, os
from time import sleep

name=sys.argv[0]

def usage():
	print >> sys.stderr, '''
Usage: 1. %s <ihaplo.out> <map.NN> <marker1> <marker2> [--margin <N>]
   OR  2. %s <ihaplo.out.zoom> <map.zoom> --check <N> [ unaffs ] [--hz] [--DEBUG]

   try %s --help  for helpful examples.

   --margin <N>  Extracts window with a margin of N markers
       both before and after the region of interest.
       writes out ihaplo.out.zoom

   --check <N>   Checks the region of interest for homogenous
       stretches greater than the <N> amount across all
       individuals. Prints out tuple of markers specifying (many)
       regions of homozygosity across affected alleles.
   
    --hz       Includes heterozygotic matching regions too

    --DEBUG    Outputs a table of the alleles current being
        checked at the current marker 
     
    --remap <file> Converts markers from one format to another.
                   File should be 4 columns: chr,pos,marker,rs_marker
                   See kgp2rs for a map file

   unaffecteds
       forces the script to check unaffected individual(s)
       against homozygous regions in the affecteds.
       To check multiple individuals, specify with a '+'
          e.g.  7612+45102
		

''' % (name,name,name)
	sys.exit(0)

def help():
	print >> sys.stderr, '''
Example Usage:
1.  %s c02/ihaplo.out --check 100 >  regions_of_interest.txt

        This takes in a large ihaplo.out file from chromosome 2
    in allegro folder and prints to file any homozygous stretch
    of alleles between affected individuals to the regions_of_
    interest.txt file.

    Contents of regions_of_interest.txt list these regions or 
    'peaks' in ascending order of how many markers lie between
    the markers:
    
    rs1234567,rs456788 : 5
    rs4000011,rs301001 : 6
    rs7777777,rs8888888 : 15


2.  %s c02/ihaplo.out rs7777777 rs8888888

       Since the longest stretch of markers lies between
    rs7777777 and rs88888888 we want to extract that region and
    take a closer look at it.
 
    The command above does so, and writes out a new ihaplo file
    (ihaplo.zoom) and a new mapfile (map.zoom). The map file is
    needed in order for HaploPainter to work correctly, and it 
    is generated by the map file in the same chromosome folder
    as the ihaplo.out file (c02/map.02)


3.  printHaploRegions.sh [List of Markers] [messner_file <chrN> ]
 
       A shell script is then used to take the newly generated
    files and create a PDF that highlights the wanted regions.
    
    Please type printHaploRegions.sh --help for more information.

''' % (name, name)
	sys.exit(-1)


class Individual:

	def __init__(self, line, fam_name, personal_name, mum, dad, sex, affected, allele1=[], allele2=[]):
		self.line = line
		self.family = fam_name;		self.id = personal_name
		self.mum = mum;				self.dad = dad;
		self.sex = sex;				self.affected = affected
		self.allele1 = allele1;		self.allele2 = allele2

	def getAllelesAt(self, marker):
		index = markers.index(marker)
		if index==-1:
			return -1

		return [self.allele1[index], self.allele2[index]]

	def matchingAllelesAt(self, marker):
		ally1, ally2 = self.getAllelesAt(marker)
		if (ally1 == ally2):
			return ally1;
		else:
			return False;

	def retrieveRegion(self, mark1, mark2, allele1=True, table=False):
		index1 = markers.index(mark1)
		index2 = markers.index(mark2)

		if index1==-1 or index2==-1:
			return -1

		index2 += 1
		
		if table:
			return self.allele1[index1:index2],self.allele2[index1:index2]

		if allele1:
			return reduce( lambda x,y: x+"  "+y, self.allele1[index1:index2])
		else:
			return reduce( lambda x,y: x+"  "+y, self.allele2[index1:index2])



def grabdata(haplo_file):
	try:
		f=open(haplo_file,"r")
	except IOError:
		print >> sys.stderr, "Cannot open %s" % haplo_file
		sys.exit(-1)

	headers = [];
	haplo_data = [];

	for line in f:
		if line.startswith("  "):
			headers.append(line)
		else:
			haplo_data.append(line)

	return headers, haplo_data


def processHeaders(head):
	row_data=[]

	# Start column of where marker names start
	start_pos= -1
	ind=0
	while True:
		charac = head[-1][ind];
		if charac!=' ':
			start_pos = ind
			break;
		ind +=1

	if start_pos == -1:
		print >> sys.stderr, "start_pos unable to match!"
		exit(-1)

	#Populate matrix
	for m_line in head:
		tokens = m_line[start_pos:]
		row_data.append(tokens)


	markers=[]

	for y in xrange(len(row_data[4])):
		#transpose matrix
		name = ""
		for x in xrange(len(row_data)):
			name += row_data[x][y]
		
		name = name[::-1].strip()
		if (len(name)> 1):
			markers.append(name)

	return markers, start_pos


def getAlleleData(data, start):
	#Stores individuals and their data
	indiv_array = []
	name_array=[]

	for line in data:
		if len(line)>4:	
			dats = line[0:start]

			fam, pid, mum, dad, gen, affect = dats.split()
			m = Individual(dats, fam, pid, mum, dad, gen, affect)	

			curr_allele = line[start:].replace(" ","").strip()

			if pid not in name_array:
				m.allele1 = curr_allele
				indiv_array.append(m)
				name_array.append(pid)
			## Already exists retrieve
			else:
				index = name_array.index(pid)
				indiv_array[index].allele2 = curr_allele
			
	return indiv_array


def reconstructHeaders(mark1, mark2, start):
	
	global convert_map
	
	index1 = markers.index(mark1)
	index2 = markers.index(mark2)

	if index1==-1 or index2==-1:
		print >> sys.stderr, "[Error] Cannot find marker specified"
		sys.exit(-1)

	index2 +=1 #include outer marker

	marks = markers[index1:index2]

	# First pass: Define matrix height (longest snp name)
	max_len=0
	for macaras in marks:
		lenmac = len(convert_map[macaras])
		if lenmac > max_len:
			max_len = lenmac

	# Second pass: Populate matrix
	matrix = []
	for macaras in marks:
		line = ""
		macaras = convert_map[macaras]
		for char in macaras:
			line += char

		# Buffer end of line with spaces
		if len(line) < max_len:
			line += " "*(max_len-len(line))

		matrix.append(line)
	
	# Third pass: Transpose, reverse, and prepend with spaces
	head_out=""

	len_height = len(matrix[0])
	for x in xrange(len_height):
		len_width = len(matrix)

		head_out += " "*start

		for y in xrange(len_width):
			head_out += matrix[y][len_height-x-1]+"  "

		head_out += "\n"

	return head_out


def writeTable(marker1 = 0, marker2 = 0, indivs = 0, mapfile=-1):

	global convert_map

	newhaplo= "ihaplo.table"

	try:
		f=open(newhaplo,'w')
	except IOError:
		print >> sys.stderr, "[Error] Cannot open new haplo file to write"
		sys.exit(-1)

	#f.write(reconstructHeaders(marker1, marker2, start)+'\n')

	#famid =""

	#Header
	for person in indivs:
		if int(person.id) not in [x for x in xrange(1,16)]:continue
		f.write('\t'+str(person.id))
	f.write('\n')
	
	# Data      
        if marker1 == '0' or marker2=='0':
                marker1=markers[0]
                marker2=markers[-1]

	index1 = markers.index(marker1)
	index2 = markers.index(marker2)+1

	#Markers
	marker_list = markers[index1:index2]
	
	indexer = 0
	for mark in marker_list:
		f.write(mark)
		
		for person in indivs:
			if int(person.id) not in [x for x in xrange(1,16)]:continue
			
			vals = person.retrieveRegion(marker1, marker2, True, True)
			a1 = vals[0][indexer]
			a2 = vals[1][indexer]
			f.write('\t%s%s' % (a1,a2))
		f.write('\n')
		indexer += 1

	f.close()
	print >> sys.stderr, "\nwritten %s" % newhaplo



def writeNewHaplo(marker1, marker2, indivs, mapfile=-1):

	global convert_map

	def writeNewMapFile():
		mapnew='map.zoom'
		try:
			fmap=open(mapfile, 'r')
			fw=open(mapnew, 'w')
		except IOError:
			print >> sys.stderr,"[Error] Cannot open map file"
			sys.exit(-1)

		fw.write(fmap.readline())# Grab header
		
		# Extract

		grab=False
		for line in fmap:
			vals = line.split()
			check_marker = vals[2].strip()
			vals[2] = convert_map[check_marker]
			
			line = (' '.join(vals))+'\n'
			
			if grab:
				fw.write(line)

				if check_marker==marker2.strip():
					grab=False
					break

			else:
				if check_marker==marker1.strip():
					grab=True
					fw.write(line)

		fmap.close()
		fw.close()
		return mapnew


	newhaplo= "ihaplo.out.zoom"

	try:
		f=open(newhaplo,'w')
	except IOError:
		print >> sys.stderr, "[Error] Cannot open new haplo file to write"
		sys.exit(-1)

	f.write(reconstructHeaders(marker1, marker2, start)+'\n')

	famid =""

	for person in indivs:
		famid = person.family

		f.write( person.line )
		f.write( person.retrieveRegion(marker1, marker2, allele1=True)+'\n')
		f.write( person.line )
		f.write( person.retrieveRegion(marker1, marker2, allele1=False)+'\n')

	f.close()
	print >> sys.stderr, "\nwritten %s" % newhaplo


	if mapfile!=-1:
		newmap = writeNewMapFile()
		print >> sys.stderr, "written %s" % newmap

		chrome = mapfile.rsplit('.',1)[1]
		outname = "chr%s_%s_%s.pdf" % (chrome, marker1, marker2)


#====== Homozygosity Mapping ======#

def generatePersonList(persons, unaffected_hz_check):

	affecteds = filter( lambda x: x.affected=="2", persons);
	print >> sys.stderr, "\n[Info] Affected = %s" % map(lambda x: x.id, affecteds);

	if unaffected_hz_check==-1:
		 print >> sys.stderr, "[Info] Checking affected individuals only" 
		 return affecteds, []

	else:
		unaffecteds = unaffected_hz_check.split('+')

		## Check for valid ID
		ids = map( lambda i: i.id, persons )
		for unaff in unaffecteds:
			if unaff not in ids:
				print >> sys.stderr, "[Error] Individual %s is not in the ihaplo file" % unaff
				sys.exit(-1);

		unaff = filter( lambda x: (x.id in unaffecteds) and (int(x.affected)<=1), persons );

		print >> sys.stderr, "[Info] Checking affected individuals against %s" % str(map(lambda x: x.id, unaff))
		return affecteds, unaff
	

### Heterozygous AND Homozygous mapping

def checkMapping(persons, markers, min_stretch, unaffected_hz_check, homozy_map=True, DEBUG=False):

	affecteds, unaff = generatePersonList(persons, unaffected_hz_check);
#	print map(lambda x: x.id, affecteds), map(lambda x: x.id, unaff)

	if homozy_map:
		print >> sys.stderr, "[Info] Performing Homozygosity checking\n"
	else:
		print >> sys.stderr, "[Info] Performing Heterozygosity checking\n"


	if DEBUG:
		print >> sys.stderr, "Marker:\t\t", reduce(lambda y,z: y+"\t"+z, map(lambda x: x.id, affecteds)),
		if unaff:
			print >> sys.stderr, reduce(lambda y,z: y+"\t"+z, map(lambda x: x.id, unaff))
		print >> sys.stderr, ""

	num_markers = len(markers)

	index=0
	record=True
	current_region = []  	# Global holder of current region
	stretch = 0				# Length of current stretch

	regions = [] 			# Populated by current_regions

	while index < num_markers:

		mark = markers[index]

		if DEBUG:
			sleep(0.1);
			print >> sys.stderr, mark, ":\t", 
		
		allele_vals1 =-1
		allele_vals2 =-1

		# Ideal scenario for a particular marker
		affec_match_all = True		## All affected must match the marker value
		unaff_match = False			## Not one unaffected must match the marker value

		for person in affecteds:
			common_val = person.getAllelesAt(mark)
			if not(common_val): #i.e marker not found -- ?
				print >> sys.stderr, "Not found %s " % mark
				exit(0)

			a1, a2 = common_val

			if DEBUG:
				print >> sys.stderr, a1, a2,"\t",

			if homozy_map:
				if a1!=a2:
					## First check that alleles of individual match each other for marker
					affec_match_all = False
					if DEBUG:
						print >> sys.stderr, "NOHOM",		#Not homozygous

					break
				else:
					## If so, check individual across other affected individuals
					if allele_vals1==-1:					# stick first value
						allele_vals1 = a1;
					else:									# Check all others in relation to it
						if a1 != allele_vals1:		# If it's a unique common_val (e.g. 2-2 vs 1-1) --> break
							affec_match_all = False
							if DEBUG:
								print >> sys.stderr, "HOM_NE_ALL",		#Homozygous notequal all

							break;

			# Heterozygosity mapping
			else:
				if allele_vals1 == -1:						# Stick first values
					allele_vals1 =  a1
					allele_vals2 =  a2
				else:
					if not(a1==allele_vals1 and a2==allele_vals2):	# Compare all others to first values
						affec_match_all = False

						if DEBUG:
							print >> sys.stderr, "HET_NE_ALL", #Heterozygous notequall all
	
						break;


		# Repeat method for unaffecteds, but this time break if their common_val IS in the alleles array
		for person in unaff:
			common_val = person.getAllelesAt(mark)
			if not(common_val): #i.e marker not found -- ?
				print >> sys.stderr, "Not found %s " % mark
				exit(0)

			a1, a2 = common_val

			if DEBUG:
				print >> sys.stderr, a1, a2,

			if homozy_map:								# For homozygosity mapping, check to see if
				if a1==a2 and a1 == allele_vals1:		# unaffected allele matches the affected ones
					unaff_match = True					# if so, break
					if DEBUG:
						print >> sys.stderr, "HOM_EQ_AFF", #Homozygous unaffected equals affected

					break;

			else:												# For heterozygosity mapping, check to see if
				if (a1 == allele_vals1) and (a2 == allele_vals2):	# unaffected allele1 matches the affected allele1
					unaff_match = True							# and etc for allele2.
					if DEBUG:
						print >> sys.stderr, "HET_EQ_AFF", #Heterozygous unaffected equals affected
					break


		# Record logic using information now gathered

		# aff_all  |  unaff_single  =  record
		#====================================
		#    0     |        0       =	 0
		#    0     |        1       =    0
		#    1     |        0       =    1  <-- ONLY scenario where recording should occur
		#    1     |        1       =    0

		if DEBUG:
			print >> sys.stderr,"| "+str(affec_match_all)+"  "+str(unaff_match)+" "+str(stretch)
	
		# Yay matches
		if affec_match_all and not(unaff_match):	# If not recording, add first marker and start
			if not(record):	
				current_region.append(mark)
				record=True
			stretch += 1
		# Nay matches
		else:
			if record:		#If already recording, add the last marker, and score, and stop
 				if (stretch > min_stretch):
					current_region.append(markers[index-1]);
					current_region.append( stretch )
					regions.append( current_region )
				record = False

				# Reset / Clear
				stretch = 0;
				current_region = []

		index += 1;

		if not(DEBUG) and index%10==0:
				print >> sys.stderr, "\r[Progress] %d%%, found %d regions greater than %d markers." % (
						int(100*float(index)/float(num_markers)), len(regions), min_stretch),


	## Final check to see if entire marker window was actually a giant consistent region
	entire = False
	if stretch >= num_markers-1:
		regions.append( (markers[0], markers[-1], stretch) )
		entire = True


	print >> sys.stderr, "\r[Progress] 100%%, found %d regions greater than %d markers. %s\n" % (
					len(regions), min_stretch, "\n(i.e. THE ENTIRE REGION)" if entire else "")
	return regions


# ===== conversion map =========

def populateConversionMap(markers, mapconvertfile):
	
	conversion_map = {}
	
	if not mapconvertfile:
		for marker in markers:
			marker = marker.strip()
			if marker not in conversion_map:
				conversion_map[marker] = marker		# Yep, dummy map
			else:
				print >> sys.stderr, "Marker duplicate!", marker
	
	else:
		print >> sys.stderr, "Populating conversion map...",
		
		l_count = 0
		for line in open(mapconvertfile,'r'):
			l_count += 1
			
			chr, pos, mark, rs_marker = map(lambda x: x.strip(), line.splitlines()[0].split('\t'))
			
			if mark not in conversion_map:
				conversion_map[mark] = rs_marker
				
				if l_count % 1234==0:
					print >> sys.stderr, "\r\t\t\t\t\t%d" % l_count,
			else:
				print >> sys.stderr, "Marker duplicate!", marker, rs_marker
		print >> sys.stderr, ""
		
	return conversion_map


#======== A R G S ============

def parse_args():

	lenarg = len(sys.argv)-1
	index=lenarg

	# args
	haplo=-1; mark1 = mark2 = " "
	mapfile= -1; margin=0
	check=-1; unaffecteds = -1;
	hz=True; deb= False;
	mapconv = False;

	while index>0:
		arg = sys.argv[index]

		if arg[0]=='-':
			if arg=="--margin":
				try:
					num = sys.argv[index+1]
					margin=int( num )
				except ValueError:
					print >> sys.stderr, "Margin: Not a number"
					sys.exit(-1)
				except IndexError:
					print >> sys.stderr, "Margin: Give a number"
					sys.exit(-1)	
	
				sys.argv.remove(num)
				sys.argv.remove(arg)
			
			elif arg=="--remap":
				try:
					mapconv= sys.argv[index+1]
				except IndexError:
					print >> sys.stderr, "Remap: Give a file"
					sys.exit(-1)

				sys.argv.remove(mapconv)
				sys.argv.remove(arg)
			
			elif arg=="--check":
				try:
					num= sys.argv[index+1]
					check = int(num)
				except ValueError:
					print >> sys.stderr, "check : Not a number"
					sys.exit(-1)
				except IndexError:
					print >> sys.stderr, "check : Give a number"
					sys.exit(-1)	
			
				sys.argv.remove(num)
				sys.argv.remove(arg)

			elif arg=="--hz":
				hz=False
				sys.argv.remove(arg)

			elif arg=="--DEBUG":
				deb=True
				sys.argv.remove(arg)
			
			elif arg=="--help":
				help();
			else:
				usage()
		
		index -=1

	sys.argv.remove(name)
	files=sys.argv

	if check==-1:
		if len(files)!=4:
			usage()
		haplo = files[0]; mapfile=files[1]; mark1 = files[2]; mark2 = files[3]
	else:
		if check < 1:
			print >> sys.stderr, "[Check] Minimum stretch amount is 1"
			check = 1

		try:
			int(files[-1])	
			unaffecteds = files[-1]
		except ValueError:
			unaffecteds = -1
	
		if len(files)==2:
			haplo = files[0]; mapfile=files[1]
		else:
			haplo = files[0]; mapfile=files[1]; unaffecteds= files[2]

	return 	haplo, mark1, mark2, mapfile, margin, check, unaffecteds, hz, deb, mapconv


#========= M A I N ====================
try:

	haplo_file, marker1, marker2 , mapfile, margin, check, unaffecteds, hz, DEB, mapconvert = parse_args()

	headers, haplos = grabdata(haplo_file)
	markers, start = processHeaders(headers)
	
	individuals = getAlleleData(haplos, start)
	convert_map = populateConversionMap(markers, mapconvert)  # if mapconvert == False, this is a dummy map where key=val
	
	writeTable(marker1, marker2, individuals)
	exit(-1)

	## Quality check:
	if len(markers) != len(individuals[0].allele2):
		print >> sys.stderr, ("[Error!] Number of markers dont match between headers and alleles:",	len(markers), len(individuals[0].allele2))		
		sys.exit(-1)


	if check != -1:
#		regions_of_interest = checkHomozygosity1(individuals, markers, check, unaffecteds)
		regions_of_interest = checkMapping(individuals, markers, check, unaffecteds, hz, DEB)

		if len(regions_of_interest)>0:
			regions_of_interest.sort(key=lambda x: x[2])

			for region in regions_of_interest:
				print >> sys.stdout, region[0]+","+region[1]+" : "+str(region[2])

			print >> sys.stderr, "\n\nLongest Region: %s: %d" % ( str(regions_of_interest[-1][0:2]) ,  regions_of_interest[-1][2] )
		print >> sys.stderr, "\n"

	else:
		#Update input markers to those specified by the margins (also check if exists)
		indy1 = markers.index(marker1)-margin
		indy2 = markers.index(marker2)+margin
		if indy1 >= 0:
			marker1 = markers[indy1]
		if indy2 < len(markers):
			marker2 = markers[indy2]

		writeNewHaplo(marker1, marker2, individuals, mapfile)
		

except KeyboardInterrupt:
	print >> sys.stderr, "\n[Terminated]"
	sys.exit(-1)

