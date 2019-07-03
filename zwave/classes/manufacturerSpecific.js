const { getOrAddService } = require('../../homekit/util');

const Index = {
  LoadedConfig: 0,
  LocalConfig: 1,
  LatestConfig: 2,
  DeviceID: 3,
  SerialNumber: 4
}

function value({ Service, Characteristic, accessory, value, get }) {
  const { value_id: valueId, index } = value;
  const service = getOrAddService(accessory, Service.AccessoryInformation);
  let characteristic;

  switch (index) {
    case Index.DeviceID:
      break;

    case Index.SerialNumber:
      if (value.value) {
        characteristic = service.getCharacteristic(Characteristic.SerialNumber);
      }
      break
  }

  characteristic && characteristic
    .setProps({ valueId })
    .on('get', cb => get(valueId, cb));
}

module.exports = { Index, value }
