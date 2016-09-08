#!/usr/bin/perl

#
# gh.pl :  Prepare Genehunter output for displaying with gnuplot
# Syntax    :  gh_snp_lod.pl [-h] [-clean] 
# Infiles   :  gh_<v>.out (default)
# Outfiles  :  myghlod.gp, chr_line and lod.plt
# Modified  : 22-Mar-2005	FR

use Cwd;

print "\n\n";
print " * * * * * * * * * * * GH_SNP_LOD.PL v1.1  * * * * * * * * * * * *\n";
print " * * * * * * * View Genehunter results with GNUPLOT  * * * * * * * \n";

my $nodelete=0;
my $hline=1;
my $mod=0;		# if 1 print LODs of modscore analysis
my $tit=1;

for ($i=0;$i<=$#ARGV;$i++){
	if ($ARGV[$i] =~ "-h" ) { &Help;}
	if ($ARGV[$i] =~ "-v" ) { &Help;}
	if ($ARGV[$i] =~ "-nodelete" ) { $nodelete=1;}
	if ($ARGV[$i] =~ "-clean" ) { &Clean;}
	if ($ARGV[$i] =~ "-nohline" ) {$hline=0;}
	if ($ARGV[$i] =~ "-notitel" ) {$tit=0;}
	if ($ARGV[$i] =~ "-mod" ) {$mod=1;}
}


print "\nPlease wait ...\n";

my $maxlines = 999999; 	# Maximum number of lines (input-file)

my @xsums=();
my $xsum = 0.0;
my $lastxsum=0.;
my $xmin = 0;

my $ymax = 2;
my $ymin = -3;

my $pfad = getcwd();
my $datum = scalar localtime;
my %chrlabel=();

#######################################    M A I N   #############################															
open (out4,">$pfad/lod.plt") || die "could not open lod.plt :$!\n";

#foreach my $dir (c06) {
foreach my $dir (c01,c02,c03,c04,c05,c06,c07,c08,c09,c10,c11,c12,c13,c14,c15,c16,c17,c18,c19,c20,c21,c22,c23,cX,c24,cxy) {
	if (-d $dir) {
		$gh_tsh=0;	# is there a total stat het for this chrom
		foreach my $i ( 1..1000000) {
			$ghout="gh_$i\.out";	
			$in_file = "$dir/$ghout";
			if (-f "$in_file") {	  
				print "File: $in_file"; 
				&ReadLod(); 
				print "\n";
			}
		} 
		if ($gh_tsh==1) {		# chromosome label
			my $xpos=(($lastxsum + $xsum)/2);
			my $var=$dir; $var =~ s/c0//;$var =~ s/c//;
			if ($var eq "23"){$var = "X";}
			if ($var eq "24"){$var = "XY";}
			if ($var > 9){ $xpos -=30;}
			else { $xpos -=5;}
			$chrlabel{$var}=$xpos;
			$lastxsum=$xsum;
		}
		push (@xsums,$xsum);
		print out4 "\n";  
	}
	else { print "$dir not existing \n";
	}
} # end foreach

close (out4);
&print_chr_line;
&pr_batch;

# print "\nYou can now view results by \"gnuplot myghlod.gp\" \n\n";
system ("gnuplot myghlod.gp");

print "\nready ...\n\n";
if ($nodelete == 0) { &Clean;}

#################################   R E A D L O D   #################################  

sub ReadLod {
	my @v=();	# Array infile (Genehunter outfile)
	open (infile, "$in_file") || die "could not open $in_file :$!\n";
	while (<infile>){
		chomp;
		$_ =~ s/,-/, -/g;
		$_ =~ s/-INFINITY/-99.99/g;
		$_ =~ s/NaN/\-0.50/g;
		$_ =~ s/nan/\-0.50/g;
		
		push (@v,$_);
	}
	close (infile);

	my $jetzt = $maxlines;
	my $xmax = 0.0;
	my $count=0;
	my $c_tsh=0;	# Counter total stat het - lines

	foreach $line (@v) {
		@feld =	split(' ',$line);
		$count++;
		if (($feld[0] =~ /Totalling/) && ($feld[1] =~ /pedigrees:/))   { 
			print "  read: total stat";
			$c_tsh++;
			$gh_tsh=1;
		}
	
		if (($feld[2] =~ /alpha,/) && ($mod == 0) && ($c_tsh ==1))  { $jetzt = $count;}
		if (($feld[2] =~ /alpha,/) && ($mod == 1) && ($c_tsh ==2))  { $jetzt = $count;}
	
		if ($feld[0] =~ /file/) { $jetzt = $maxlines;}

		if (($feld[5] =~ /npl_plot.ps/) || ($#feld < 1)) { $jetzt = $maxlines;}

		if ($count > $jetzt) {
			printf(out4 "%f %s\n", ($feld[0] + $xsum), $feld[1]);
			if ($feld[0] > $xmax) { $xmax = $feld[0];}  
			if ($feld[1] > $ymax) { $ymax = $feld[1];}
		}
	} # end foreach
	
	$xsum = $xsum + $xmax;
	if (($c_tsh > 1) && ($mod == 1)) { print "  Read the second total stat region\n";}
	if (($c_tsh > 1) && ($mod == 0)) { print "  Read the first total stat region\n";}
	if ($c_tsh == 0) { print "  Warning: file has no \"Total stat het\" region\n";}
} ## end ReadLod

######################   P R I N T  C H R _ L I N E S   ######################
sub print_chr_line {

#	$xsum = 3700;		# for a fixed axle in every picture
	$ymax += 1;						# y-achse auf ganze HLOD-Zahl bringen
	@buff =	split('\.',$ymax);		# round to integer
	$ymax=$buff[0];
	
	open (out3,"> chr_line") || die "could not open chr_line :$!\n";

	if ($hline=1){
		for (my $i=-2; $i<$ymax;$i++) {	# horizontale Linien bei LODs = 1,2,3,4,..
			print out3 "0 $i\n$xsum $i\n\n";
		}
	}

	foreach (@xsums){	# vertikale Linien Chromosomenende 1,2,3,4,...22,x,xy
		print out3 "$_ $ymin \n$_ $ymax \n\n";         
	}
	close (out3);
}
###-----------------------  P R I N T  G N U P L O T  B A T C H   -----------------------###
sub pr_batch {

	if ($mod==0){$titel = "$pfad - GH2 LOD (Total stat het)   - $datum";}
	else {$titel = "$pfad - GHM MODscore (Total stat het)   - $datum";}
	
	open (out5,"> myghlod.gp") || die "could not open myghlod.gp :$!\n";

	print out5 "set autoscale\n";
	print out5 "set nokey\n";
	if ($tit==1) {print out5 "set title \"$titel\\n\"\n";}
	print out5 "set xlabel \"cM\"\n";
#	print out5 "set xlabel \"MB\"\n";
	print out5 "set ylabel \"LOD\"\n";
	my $ypos = $ymax + (($ymax-$ymin)/14);
	
	foreach (keys %chrlabel) {print out5 "set label \"$_\" at $chrlabel{$_}\,$ypos font \"Ariel,8\"\n";}
	print out5 "set size 1,0.6\n";
	print out5 "set terminal postscript color\n";
	if ($mod==0){print out5 "set output \"gh_snp_lod.ps\"\n";}
	else {print out5 "set output \"gh_snp_lod_mod.ps\"\n";}
	print out5 "plot \[$xmin\:$xsum\] \[$ymin\:$ymax\]  \'lod.plt\' with lines, \'chr_line\' with lines\n";
#	print out5 "set terminal x11\n";
#	print out5 "plot \[$xmin\:$xsum\] \[$ymin\:$ymax\]  \'lod.plt\' with lines, \'chr_line\' with lines\n";
#	print out5 "\npause -1 \"Hit return to continue\"\n\n";

	close (out5);

} ## end pr_batch
					

#################################   H E L P   #################################  
sub Help {

print " * * * * * *  Created by Franz Rueschendorf 2-Jan-2003 * * * * * * \n";
print " * * * * * * * * * Max-Delbrueck-Center, Berlin  * * * * * * * * * \n";
print " * * * * * * * * * email: fruesch\@mdc-berlin.de  * * * * * * * * * \n\n";
print "  Usage        : gh_snp_lod.pl [-h] [-clean] [-nohline] [-nodelete] [-nolabel]\n";
print "  Infiles      : gh_<v>.out (default) \n";
print "  Outfiles     : myghlod.gp, chr_line and lod.plt \n" ;
print "  View results : gnuplot myghlod.gp\n\n";
exit 0;
}

################################   C L E A N   ################################  
#
# removes files in the current folder (with the extension *.plt *.gp and chr_line)
#
sub Clean { 
#unlink glob("*.plt");
#unlink glob("*.gp");
#unlink glob("chr_line");
exit 0;
}

### end end gh_snp_lod.pl
