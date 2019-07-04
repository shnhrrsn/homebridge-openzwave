function map(inMin, inMax, outMin, outMax, isInt) {
  if (isInt) {
    return x => Math.round((x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin);
  }

  return x => (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

module.exports = {
  map
}
