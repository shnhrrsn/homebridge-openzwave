// const rangeMap = require('range-map');
const { getClassValues, getValueByIndex, getOrAddService } = require('../../util')
const { index: switchBinaryIndex, id: switchBinaryClassId } = require('./switchBinary');
const { switchMultilevel } = require('./index')

const index = {
  level: 0,
  bright: 1,
  dim: 2,
  ignoreStartLevel: 3,
  startLevel: 4,
  duration: 5,
  step: 6,
  inc: 7,
  dec: 8,
  targetValue: 9
}

function bind({ Service, Characteristic, bridge, accessory, node, values }) {
  const switchBinaryValues = getClassValues(node, switchBinaryClassId);
  const switchBinaryValue = getValueByIndex(switchBinaryValues, switchBinaryIndex.level);
  const switchBinaryValueId = switchBinaryValue ? switchBinaryValue.value_id : null;

  const { value_id: valueId } = getValueByIndex(values, index.level);

  const serviceLightbulb = getOrAddService(accessory, Service.Lightbulb);
  const on = serviceLightbulb.getCharacteristic(Characteristic.On);
  const brightness = serviceLightbulb.getCharacteristic(Characteristic.Brightness);

  if (switchBinaryValueId) {
    on
      .on('set', (value, cb) => bridge.setValue(switchBinaryValueId, value, cb))
      .on('get', cb => bridge.getValue(switchBinaryValueId, cb));

    bridge.onValueChanged(switchBinaryValueId, value => on.updateValue(value));
  } else {
    // in case device doesn't have the switch binary class
    on
      .on('set', (value, cb) => bridge.getValue(valueId, (err, level) => {
        if (err) {
          return cb(err);
        }

        if (value && level === 0) {
          return bridge.setValue(valueId, 100, cb);
        }

        if (!value && level !== 0) {
          return bridge.setValue(valueId, 0, cb);
        }

        cb();
      }))
      .on('get', cb => bridge.getValue(valueId, (err, value) =>
        cb(err, value !== 0)
      ));
  }

  brightness
    .on('set', (value, cb) => bridge.setValue(valueId, value, cb))
    .on('get', cb => bridge.getValue(valueId, cb));

  // if device has switchBinary class as well sync them
  const serviceSwitch = accessory.getService(Service.Switch);
  const switchOn = serviceSwitch && serviceSwitch.getCharacteristic(Characteristic.On);

  bridge.onValueChanged(valueId, value => {
    switchOn && switchOn.updateValue(value !== 0);
    on.updateValue(value !== 0);
    brightness.updateValue(value);
  });
}


module.exports = { id: switchMultilevel, index, bind }
