#!/usr/bin/env python

import csv
import sys


def clean(s):
    return s.strip().lower()


def main(args):
    rows = []
    cols = set([])
    for filename in args.input_files:
        with file(filename, 'rU') as f:
            reader = csv.DictReader(f)
            for row in reader:
                o = dict([(clean(k), row[k]) for k in row.iterkeys()])
                rows.append(o)
                cols.update(o.keys())

    writer = csv.DictWriter(sys.stdout, cols)
    writer.writeheader()
    writer.writerows(rows)


if __name__ == '__main__':
    from argparse import ArgumentParser
    parser = ArgumentParser('Combine multiple CSV files into a single file')
    parser.add_argument('input_files', metavar='CSV', nargs='+',
        help='Input CSV files')

    args = parser.parse_args()

    main(args)
