#! /bin/sh

set -e

rm -rf build
rm -rf dist
gulp
nwb nwbuild -v 0.22.3 -p osx64,win64,linux64 ./build/ -o dist