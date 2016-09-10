#!/bin/csh -f
# C-shell file name: sw2_haplo.06.sh
#----------------------------------------------
#   Mega2 version 4.2
#   Run date:                2016-9-10-16-05
#   This script created on   Sat Sep 10 16:07:17 2016
#   Input file names:
#       Pedigree file:              pedin_3.06
#          Locus file:              datain_3.06
#            Map file:              map_3.06
#    Untyped pedigree option  Include all pedigrees whether typed or not
#----------------------------------------------
# Chromosome number:    6
echo 
echo Commencing haplotyping run for chromosome  6 using SimWalk2
echo 
unalias rm
unalias cp
foreach i (0 1 2 3 4 5 6 7)
	 if (-e ERROR-0$i.TXT) then
		rm -f ERROR-0$i.TXT
	endif
end
if (-e RERUN-01.BCH) then
	rm -f RERUN-01.BCH
endif
rm -f PEDIGREE.DAT
rm -f LOCUS.DAT
rm -f MAP.DAT
rm -f PEN.DAT
rm -f BATCH2.DAT
cp sw2_pedigree.06 PEDIGREE.DAT
cp sw2_locus.06 LOCUS.DAT
cp sw2_map.06 MAP.DAT
cp sw2_pen.06 PEN.DAT
cp sw2_batch.06 BATCH2.DAT
simwalk2
if ( -e ERROR-01.TXT ||  -e ERROR-00.TXT ) then 
   echo Please check ERROR files.
   exit 1
endif
echo "************"
echo SimWalk2 finished the first complete haplotype run.
if ( -e RERUN-01.BCH ) then
   rm -f BATCH2.DAT
   cp RERUN-01.BCH BATCH2.DAT
   rm RERUN-01.BCH 
echo Simwalk2 suggested a second haplotype run
echo starting the second haplotype run
    simwalk2
else 
  echo No more runs were suggested
  echo "************"
  exit 0
endif
if ( -e ERROR-02.TXT ||  -e ERROR-00.TXT ) then 
   echo Please check ERROR files.
   exit 1
endif
echo "************"
echo SimWalk2 finished the second complete haplotype run.
if ( -e RERUN-02.BCH ) then
   rm -f BATCH2.DAT
   cp RERUN-02.BCH BATCH2.DAT
   rm RERUN-02.BCH 
echo Simwalk2 suggested a third haplotype run
echo starting the third haplotype run
     simwalk2
else 
  echo No more runs were suggested
  echo "************"
  exit 0
endif
if ( -e ERROR-03.TXT ||  -e ERROR-00.TXT ) then 
   echo Please check ERROR files.
   exit 1
endif
echo "************"
echo SimWalk2 finished the third complete haplotype run.
if ( -e RERUN-03.BCH ) then
   rm -f BATCH2.DAT
   cp RERUN-03.BCH BATCH2.DAT
   rm RERUN-03.BCH 
echo Simwalk2 suggested a fourth haplotype run
echo starting the fourth haplotype run
    simwalk2
else 
  echo No more runs were suggested
  echo "************"
  exit 0
endif
if ( -e ERROR-04.TXT ||  -e ERROR-00.TXT ) then 
   echo Please check ERROR files.
   exit 1
endif
echo "************"
echo SimWalk2 finished the fourth complete haplotype run.
if ( -e RERUN-04.BCH ) then
   rm -f BATCH2.DAT
   cp RERUN-04.BCH BATCH2.DAT
   rm RERUN-04.BCH 
echo Simwalk2 suggested a fifth haplotype run
echo starting the fifth haplotype run
    simwalk2
else 
  echo No more runs were suggested
  echo "************"
  exit 0
endif
if ( -e ERROR-05.TXT ||  -e ERROR-00.TXT ) then 
   echo Please check ERROR files.
   exit 1
endif
echo "************"
echo SimWalk2 finished the fifth complete haplotype run.
if ( -e RERUN-05.BCH ) then
   rm -f BATCH2.DAT
   cp RERUN-05.BCH BATCH2.DAT
   rm RERUN-05.BCH 
echo Simwalk2 suggested a sixth haplotype run
echo NOT starting the sixth haplotype run
echo "*****************" 
exit 0
else 
  echo No more runs were suggested
  echo "************"
  exit 0
endif
