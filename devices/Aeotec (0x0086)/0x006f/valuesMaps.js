const { map } = require('../../../util/value');

const inMap = map(0, 100, 0, 99, true);
const outMap = map(0, 99, 0, 100, true);

module.exports = {
  '38-1-0': {
    in: inMap,
    out: outMap
  }
}
