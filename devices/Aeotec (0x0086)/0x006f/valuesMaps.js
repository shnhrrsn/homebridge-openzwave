const { map } = require('../../../util/value');

const inMap = map(0, 100, 0, 99);
const outMap = map(0, 99, 0, 100);

module.exports = {
  '38-1-0': {
    in: value => inMap(value),
    out: value => outMap(value)
  }
}
