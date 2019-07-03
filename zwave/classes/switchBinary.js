const { getValueByIndex, getOrAddService } = require('../../util')
const { switchBinary } = require('./index')

const index = {
  level: 0,
  targetstate: 1,
  duration: 2
}

function bind({ Service, Characteristic, bridge, accessory, values }) {
  const service = getOrAddService(accessory, Service.Switch);

  const { value_id: valueId } = getValueByIndex(values, index.level);
  const on = service.getCharacteristic(Characteristic.On);

  on
    .on('set', (value, cb) => bridge.setValue(valueId, value, cb))
    .on('get', cb => bridge.getValue(valueId, cb));

  bridge.onValueChanged(valueId, value => on.updateValue(value));
}


module.exports = { id: switchBinary, index, bind }
