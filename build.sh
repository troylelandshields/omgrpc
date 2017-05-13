#! /bin/sh

set -e

rm -rf build
rm -rf dist
gulp
nwb nwbuild -v 0.22.3-sdk -p osx64 ./build/ -o dist