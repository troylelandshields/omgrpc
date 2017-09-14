#! /bin/sh

set -e

rm -rf build
rm -rf dist
gulp
nwbuild -v 0.25.0 -p osx64 ./build/ -o dist