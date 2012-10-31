function(keys, values, rereduce) {
  if (rereduce) {
    return stats(values);
  }

  return values.length;
}