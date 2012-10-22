#!/usr/bin/env python

import itertools
import json
import sqlite3


def main(args):
    db = sqlite3.connect(args.db)
    c = db.cursor()

    rows = c.execute('''SELECT country, gender, cost_ratio, benefit_ratio,
        private_costs, private_benefits, public_costs, public_benefits
        FROM {}'''.format(args.table))

    obj = [dict(itertools.izip(('country', 'gender', 'cost_ratio',
        'benefit_ratio', 'private_costs', 'private_benefits', 'public_costs',
        'public_benefits'),
        row)) for row in rows]

    print '{} = {};'.format(args.varname, json.dumps(obj, indent=2))


if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser("Export data from a SQLite database to JSON")
    parser.add_argument('db', metavar='SQLITE',
        help='Path to the SQLite database')
    parser.add_argument('table', metavar='TABLENAME', help='Table name')
    parser.add_argument('varname', metavar='VARIABLE',
        help='The name of the global JavaScript variable to store the JSON to')
    args = parser.parse_args()

    main(args)
