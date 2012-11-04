#!/usr/bin/env python

import couchdb


def main(args):
    couch = couchdb.Server('http://esheehan:bogus123@localhost:5984')
    countries = set([])

    db = couch[args.db]

    for doc_id in db:
        doc = db[doc_id]

        if 'country' in doc and 'type' in doc:
            countries.add(db[doc_id]['country'])

    for c in countries:
        print '<option>{}</option>'.format(c)


if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser('Generate HTML for a select box of country names')
    parser.add_argument('db', metavar='DBNAME', help='CouchDB database name')

    args = parser.parse_args()

    main(args)
