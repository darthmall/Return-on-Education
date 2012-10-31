function(head, req) {
  var o = {}, a = [],
      row, k;

  while (row = getRow()) {
    k = row.key.slice(0, -1).join(' '),
        sector = row.key[3];

    if (!o.hasOwnProperty(k)) {
      o[k] = {};
    }

    o[k][sector] = row.value;
  }

  for (k in o) {
    if (o.hasOwnProperty(k) && !isNaN(o[k]['private']) &&
      !isNaN(o[k]['public'])) {
      a.push({'key': k, 'value': o[k]});
    }
  }

  send(JSON.stringify(a));
}