#!/usr/bin/perl
#
# mega2sw_haplo_start.pl
# Start script for genome wide SIMWALK2 calculation with sets of SNPs
# (c) 2004 Franz Rueschendorf 
# 6-Apr-2005 Adapted by John E. Landers, 

use Cwd;
use strict;
use File::Copy;
use File::Basename;

my @files=();
my $set=0;

# foreach my $chr ("02") {	# uncomment line for single chromosome analysis
foreach my $chr ("06") {

	if ( -d "c$chr") {
		
		chdir "c${chr}";
		print "Chromosome $chr\n";
		$set=0;
		@files=glob("datain_*.${chr}");

		foreach (@files){
			my $basename=basename($_);
			my @feld =	split('_',$basename);
			if ($set < $feld[1]) {$set=$feld[1];}
		}


		foreach my $i ( 1..$set) {
			copy ("datain_${i}.${chr}","datain.${chr}");
			copy ("pedin_${i}.${chr}","pedin.${chr}");
			copy ("map_${i}.${chr}","map.${chr}");
			open (OUT,">mega2_in.tmp") || die "could not open mega2_in.tmp :$!\n";

########################## Edit options for MEGA2 here ########################

			print OUT "1\n";
			print OUT "${chr}\n"; 		# Chr. number 

# If the script does not work at this point, try uncomment the following lines

			print OUT "2\n";  
			print OUT "${chr}\n"; 		# Filename Extension
			print OUT "3\n";
			print OUT "datain.${chr}\n";	# Data filename
			print OUT "4\n"; 			
			print OUT "pedin.${chr}\n";	# Ped Filename
			print OUT "5\n";
			print OUT "map.${chr}\n";	# Map Filename

			print OUT "0\n"; 			 
			print OUT "1\n";			# Simwalk format
			print OUT "1\n";			# Haplotyping
			print OUT "1\n";			# All Markers
			print OUT "0\n";
			print OUT "0\n";
			
################################## END edit options  #########################

			close (OUT);
			my $command ="mega2 --noweb < mega2_in.tmp";
			system ($command);			

			unlink "PEDIGREE.DAT";
			unlink "LOCUS.DAT";
			unlink "PEN.DAT";
			unlink "BATCH2.DAT";

			rename ("PEDIGREE.${chr}","PEDIGREE.DAT");
			rename ("LOCUS.${chr}","LOCUS.DAT");
			rename ("PEN.${chr}","PEN.DAT");
			rename ("BATCH2.${chr}","BATCH2.DAT");
			
			my $command ="simwalk2 > /dev/null";	### UNIX
#			my $command ="simwalk2 > nul";	### DOS
			system ($command);

			rename ("SCORE-01.ALL","SCORE-01_${i}.ALL");
					
			unlink "datain.${chr}";
			unlink "pedin.${chr}";
			unlink "map.${chr}";
			unlink "mega2_in.tmp";
			unlink "*.out";
			unlink "MEGA*";
			unlink "*.sh";
		
		}
		chdir  ".." ;		
	}
	else {
		print "no chromosome $chr\n";
	}
}

#################################### E N D  ##################################
