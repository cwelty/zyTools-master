#!/bin/sh
sed -e 's/"/\\"/g' -e 's/^/xml += "/' -e 's/$/\\n";/' xmlToConvertToString.txt > tmp.txt; mv tmp.txt xmlToConvertToString.txt