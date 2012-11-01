function(keys, values, rereduce) {
  var totalNPV = 0;

  for (var i = 0; i < values.length; i++) {
    totalNPV += values[i]['net present value'];
  }

  return totalNPV / values.length;
}