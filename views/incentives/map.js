function(doc) {
  if (!isNaN(doc['net present value'])) {
    emit([doc.country, doc.attainment, doc.gender, doc.sector], doc);
  }
}