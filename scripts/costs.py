#!/usr/bin/env python

import csv
import matplotlib.pyplot as plt
import numpy as np


def load_data(*args):
    rows = []

    for filename in args:
        with file(filename, 'rU') as f:
            reader = csv.DictReader(f)
            rows += list(reader)

    return rows


def feature(data, name, filters, feature_type=str):
    for d in data:
        for k, v in filters.iteritems():
            if d[k] != v:
                break

        try:
            yield feature_type(d[name])
        except:
            pass


def main():
    data = load_data('../data/table_a9.1.csv')

    width = 0.35

    men = list(feature(data, 'Total costs', {'Gender': 'male'}, float))
    women = list(feature(data, 'Total costs', {'Gender': 'female'}, float))

    fig = plt.figure()
    ax = fig.add_subplot(111)
    rects1 = ax.bar(np.arange(len(men)), men, width, color='r')
    rects2 = ax.bar(np.arange(len(women)) + width, women, width, color='y')

    plt.show()


if __name__ == '__main__':
    main()
