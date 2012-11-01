function(head, req) {
  var o = {}, a = [],
      row, k;

  while (row = getRow()) {
    k = row.key.slice(0, -1).join(' '),
        sector = row.key.slice(-1)[0];

    if (!o.hasOwnProperty(k)) {
      o[k] = {};
    }

    o[k][sector] = row.value;
  }

  for (k in o) {
    if (o.hasOwnProperty(k)) {
      a.push({'key': k, 'value': o[k]});
    }
  }

  send(JSON.stringify(a));
}