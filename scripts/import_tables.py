#!/usr/bin/env python

from argparse import ArgumentParser
import csv
import sqlite3


def value(v):
    try:
        return float(v)
    except:
        pass

    return v


def col_name(s):
    return '_'.join(map(str.lower, s.split()))


def load(files):
    cols = set([])
    rows = []

    for name in files:
        with file(name, 'rU') as f:
            reader = csv.DictReader(f)
            cols.update(map(col_name, reader.fieldnames))

            for line in reader:
                rows.append(dict([(col_name(col), value(line[col])) for col in
                    reader.fieldnames]))

    return (cols, rows)


def create_table(c, table, cols, reset=False):
    if reset:
        c.execute('DROP TABLE {}'.format(table))

    sql = 'CREATE TABLE IF NOT EXISTS {} (id INTEGER PRIMARY KEY ASC,{})'.format(table,
        ','.join(cols))
    c.execute(sql)


def insert_data(c, table, rows):
    for row in rows:
        cols = row.keys()
        sql = 'INSERT INTO {} ({}) VALUES ({})'.format(table, ','.join(cols),
            ','.join(['?'] * len(cols)))
        c.execute(sql, [row[col] for col in cols])


def main():
    parser = ArgumentParser(
        'Import data from OECD CSV files into a SQLite database.')
    parser.add_argument('-r', '--reset', action='store_true',
        help='Reset the table before importing')
    parser.add_argument('db', metavar='SQLITE',
        help='The name of the SQLite3 database file')
    parser.add_argument('table', metavar='TABLE', help='The name of the table')
    parser.add_argument('inputs', metavar='CSV', nargs='+',
        help='The CSV file(s) to import into the SQLite3 database')
    args = parser.parse_args()

    conn = sqlite3.connect(args.db)
    c = conn.cursor()

    cols, rows = load(args.inputs)

    create_table(c, args.table, cols, args.reset)
    insert_data(c, args.table, rows)

    conn.commit()
    conn.close()

if __name__ == '__main__':
    main()
