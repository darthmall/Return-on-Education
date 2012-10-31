function(doc) {
  if (doc.type === 'country' && !isNaN(doc['total costs'])) {
    emit([doc.country, doc.attainment, doc.gender, doc.sector],
      Math.abs(doc['total costs']));

    if (doc.sector === 'private') {
      emit([doc.country, doc.attainment, doc.gender, 'income tax effect'],
        Math.abs(doc['income tax effect']));
    }
  }
}