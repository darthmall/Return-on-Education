#!/bin/sh

python import.py -r -s private -l post-secondary eag ../data/private_post-secondary_npv.csv
python import.py -s public -l post-secondary eag ../data/public_post-secondary_npv.csv
python import.py -s private -l tertiary eag ../data/private_tertiary_npv.csv
python import.py -s public -l tertiary eag ../data/public_tertiary_npv.csv

couchapp push

