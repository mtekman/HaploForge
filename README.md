# HaploForge #

##### A Comprehensive Pedigree Drawing and Haplotype Visualisation Web Application #####

 * Creates pedigrees and imports/exports them using LINKAGE format.
 * Renders haplotypes for popular haplotyping/linkage programs such as Allegro, Merlin, Genehunter, and Simwalk.
 * Resolves haplotypes using a novel A\*-search based approach for autosomal *and* X-linked disease models, both recessive and dominant. 
 * Performs identity mapping for homozygous, heterozygous, and compound heterozygous disease models.
 * Can auto-generate large and complex pedigrees via meioses simulation benchmarks.

HaploForge is licensed under the [GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html). 

If HaploForge is used to analyse your work, please cite [Tekman et al, 2017](https://doi.org/10.1093/bioinformatics/btx510).

    @article{Tekman2017,
      doi = {10.1093/bioinformatics/btx510},
      url = {https://doi.org/10.1093/bioinformatics/btx510},
      year  = {2017},
      month = {aug},
      publisher = {Oxford University Press ({OUP})},
      author = {Mehmet Tekman and Alan Medlar and Monika Mozere and Robert Kleta and Horia Stanescu},
      title = {{HaploForge}: a comprehensive pedigree drawing and haplotype visualization web application},
      journal = {Bioinformatics}
    }

The live web application is hosted [here](https://mtekman.github.io/haploforge/)

![dos2.png](https://user-images.githubusercontent.com/20641402/27394280-860f8124-56a3-11e7-87ba-205b82a31055.png)


### How are haplotypes phased? ###

Haplotype applications output two types of files: phased genotypes, and vectors.

Phased genotypes encode the maternal and paternal alleles for an individual, but do not record founder allele mapping.

Vector files describe the *flow* of genetic information from one generation to the next. This can be encoded either by recording the founder allele at each individual-marker, or by recording where each recombination/crossover event took place. 

*HaploForge* by default makes of it's own novel A\*-search based algorithm to find these recombination points and determine the founder allele mapping, but also optionally makes use of vector output.


### Why is this better than HaploPainter? ###

* It's on the web, no need for extensive Perl installations
* It's current, with active development since 2014
* ***X-linked resolver***, something that HaploPainter did not correctly implement.


### How to use? ###

Simply go to the [live application](https://mtekman.github.io/haploforge/) and go through the quick video tutorials (in total no longer than 10 minutes).


***NOTE:*** Family names and Sample IDs *must* be numeric
