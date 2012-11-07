function(doc) {
  if (typeof doc['net present value'] === 'number') {
    emit(doc.sector, doc);
  }
}