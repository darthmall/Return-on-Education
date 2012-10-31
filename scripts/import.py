#!/usr/bin/env python

import couchdb
import csv


def parse(filename):
    def convert(v):
        try:
            return float(v)
        except ValueError:
            return v

    with file(filename, 'rU') as f:
        reader = csv.DictReader(f)
        for row in reader:
            for k, v in row.iteritems():
                row[k] = convert(v)

            yield dict([(k.lower(), convert(v)) for k, v in row.iteritems()])


def main(args):
    couch = couchdb.Server('http://esheehan:bogus123@localhost:5984')

    if args.reset:
        couch.delete(args.db)

    if args.db not in couch:
        couch.create(args.db)

    db = couch[args.db]

    for row in parse(args.csv):
        row['sector'] = args.sector
        row['attainment'] = args.level

        if 'average' in row['country']:
            row['type'] = 'average'
        else:
            row['type'] = 'country'

        db.save(row)


if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser(
        'Import an Education at a Glance table into CouchDB')
    parser.add_argument('db', metavar='DBNAME',
        help='Name of the CouchDB database')
    parser.add_argument('-s', '--sector', choices=['public', 'private'],
        required=True, help='Public or private sector data for this table')
    parser.add_argument('-l', '--level',
        choices=['tertiary', 'post-secondary'], required=True,
        help='Level of educational attainment for this table')
    parser.add_argument('-r', '--reset', action='store_true',
        help='Reset the CouchDB database')
    parser.add_argument('csv', metavar='CSV',
        help='The EaG table as a CSV file')
    args = parser.parse_args()

    main(args)
