function(doc) {
    if (doc.type === 'country' && !isNaN(doc['net present value'])) {
      emit([doc.country, doc.attainment, doc.gender, doc.sector],
        doc['net present value']);
    }
}