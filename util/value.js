function map(inMin, inMax, outMin, outMax) {
  return x => Math.round((x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin);
}

module.exports = {
  map
}
