#!/usr/bin/env python

import itertools
import json
import sqlite3


def readData(c, table):
    rows = c.execute('''SELECT country, gender, cost_ratio, benefit_ratio,
        private_costs, private_benefits, private_npv, public_costs,
        public_benefits, public_npv
        FROM {}'''.format(table))

    obj = [dict(itertools.izip(('country', 'gender', 'cost_ratio',
        'benefit_ratio', 'private_costs', 'private_benefits', 'private_npv',
        'public_costs', 'public_benefits', 'public_npv'),
        row)) for row in rows]

    return obj


def main(args):
    db = sqlite3.connect(args.db)
    c = db.cursor()

    post_secondary = readData(c, 'post_secondary_overview')
    for o in post_secondary:
        o['attainment'] = 'post-secondary'

    tertiary = readData(c, 'tertiary_overview')
    for o in tertiary:
        o['attainment'] = 'tertiary'

    data = filter(lambda d: bool(d['benefit_ratio']),
        itertools.chain(post_secondary, tertiary))

    print '{} = {};'.format(args.varname, json.dumps(data, indent=2))


if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser("Export data from a SQLite database to JSON")
    parser.add_argument('db', metavar='SQLITE',
        help='Path to the SQLite database')
    parser.add_argument('varname', metavar='VARIABLE',
        help='The name of the global JavaScript variable to store the JSON to')
    args = parser.parse_args()

    main(args)
