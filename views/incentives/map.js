function(doc) {
  emit([doc.country, doc.attainment, doc.gender, doc.sector], doc);
}