#! /bin/bash
BASE_DIR=$(readlink -f $0 | xargs dirname)
PREV_DIR=`pwd`

convert -resize 36x36 $BASE_DIR/icon.png $BASE_DIR/../resources/icons/android36.png
convert -resize 48x48 $BASE_DIR/icon.png $BASE_DIR/../resources/icons/android48.png
convert -resize 72x72 $BASE_DIR/icon.png $BASE_DIR/../resources/icons/android72.png
convert -resize 96x96 $BASE_DIR/icon.png $BASE_DIR/../resources/icons/android96.png
convert -resize 512x512 $BASE_DIR/icon.png $BASE_DIR/../resources/icons/icon512.png
convert -resize 57x57 $BASE_DIR/icon.png $BASE_DIR/../resources/icons/ios57.png
convert -resize 72x72 $BASE_DIR/icon.png $BASE_DIR/../resources/icons/ios72.png
convert -resize 114x114 $BASE_DIR/icon.png $BASE_DIR/../resources/icons/ios114.png
convert -resize 144x144 $BASE_DIR/icon.png $BASE_DIR/../resources/icons/ios144.png
