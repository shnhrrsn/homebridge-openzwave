const { getOrAddService } = require('../../homekit/util');

const Index = {
  Library: 0,
  Protocol: 1,
  Application: 2
}

function value({ Service, Characteristic, accessory, value, get }) {
  const { value_id, index } = value;
  const service = getOrAddService(accessory, Service.AccessoryInformation);
  let characteristic;

  switch (index) {
    case Index.Library:
      // version not yet supported by hap-nodejs
      break;

    case Index.Protocol:
      // version not yet supported by hap-nodejs
      break;

    case Index.Application:
      characteristic = service.getCharacteristic(Characteristic.FirmwareRevision);
      break;
  }

  characteristic && characteristic.on('get', cb => get(value_id, cb));
}


module.exports = { Index, value }
