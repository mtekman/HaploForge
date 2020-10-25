### This repo has migrated to GitLab
https://gitlab.com/mtekman/HaploForge
###### (The copy here is archived. Please see the above link for the latest developments)



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
        author = {Tekman, Mehmet and Medlar, Alan and Mozere, Monika and Kleta, Robert and Stanescu, Horia},
        title = {HaploForge: a comprehensive pedigree drawing and haplotype visualization web application},
        journal = {Bioinformatics},
        volume = {33},
        number = {24},
        pages = {3871-3877},
        year = {2017},
        doi = {10.1093/bioinformatics/btx510},
        URL = { + http://dx.doi.org/10.1093/bioinformatics/btx510},
        eprint = {/oup/backfile/content_public/journal/bioinformatics/33/24/10.1093_bioinformatics_btx510/1/btx510.pdf}
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

### Can I install HaploForge locally? ###

Yes, though there will be no performance benefit since HaploForge processess all data within the client web browser.

However, there is a helper script availiable in this regard:

    helpers/public/generate_public.sh

Simply run this (examples provided in help text) to generate a public webpage and then host it using your preferred hosting software (e.g. apache2, nginx, lighttpd).


***NOTE:*** Family names and Sample IDs *must* be numeric
