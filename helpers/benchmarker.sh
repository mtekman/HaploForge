#!/bin/bash

prev_loc=""

function refresh_test {
    prev_loc=$(xdotool getmouselocation | sed -r 's/x:([0-9]+)\sy:([0-9]+)\s.*/\1 \2/')

    xdotool keydown Shift
    xdotool mousemove 81 63 click 1
    xdotool keyup Shift
    sleep 1
    xdotool mousemove 249 801 click 1
}

function type_test {
    root=$1
    maxgen=$2
    allele=$3
    inbreed=$4

    xdotool type "BenchMark.launch_with_props($root,$maxgen,$allele,$inbreed, false);"
    xdotool key Return

    xdotool mousemove $prev_loc click 1
}


function run_test {
    #echo -n "Hit anything to proceed with test: $*";
    #read ans
    sleep 300

    echo "`date`     $*" >> log.txt

    refresh_test
    type_test $*
}

function run_sets {

    for allele_size in 10 100 1000 10000 100000 1000000 10000000; do
        for root_founder in 2 3 4 5 6 7 8 9 10; do
            for maxgen in 3 4 5 6 7 8 9 10; do
                for inbreed in 0 0.1 0.5 0.9; do

                    run_test $root_founder $maxgen $allele_size $inbreed
                    run_test $root_founder $maxgen $allele_size $inbreed
                    run_test $root_founder $maxgen $allele_size $inbreed
                    run_test $root_founder $maxgen $allele_size $inbreed
                    run_test $root_founder $maxgen $allele_size $inbreed

                done
            done
        done
    done
}


run_sets
