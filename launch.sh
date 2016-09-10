#!/bin/bash

browser=firefox
#browser=opera
#browser=chromium

curl http://www.google.com >/dev/null 2>&1
[ $?  != 0 ] && /nomansland/MAIN_REPOS/bash_global/jolla/tether.source
git pull origin master
~/bin/sublime_*3/sublime_text
[ "`ps aux | grep $browser | grep -v grep`" = "" ] && nohup $browser & 2>/dev/null
