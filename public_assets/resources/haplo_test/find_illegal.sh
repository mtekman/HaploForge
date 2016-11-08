#!/bin/bash

reg_hom="^rs[0-9]+\s((11\s22)|(22\s11))"

reg_illegal="$reg_hom[\s012]+(11|22)[\s012]+$"
reg_allowed="$reg_hom[\s012]+(12|21)[\s012]+$"

[ "$1" = "" ] && echo "`basename $0` <transposed_haplotypes>" && exit -1

trans_haplo=$1

(
    echo -e "Hom Parents\n==============="
    grep -P $reg_hom $trans_haplo

    echo -e "\n\nHom Parents + Het Offspring\n===================="
    grep -P $reg_allowed $trans_haplo

    echo -e "\n\n\nHom Parents + Hom Offspring\n===================="
    grep -P $reg_illegal $trans_haplo
    [ "`grep -P $reg_illegal $trans_haplo`" = "" ] && echo "(empty)"

) | less -S
