const { getOrAddService } = require('../../homekit/util');

// Scene indexes from 1..255
const Index = {
  SceneCount: 256,
  ClearSceneTimeout: 257
}

function value({ Service, Characteristic, accessory, value, set, get }) {
  const { value_id: valueId, index } = value;
//   const service = getOrAddService(accessory, Service.WindowCovering);
//   let characteristic;
//
//   switch (index) {
//     case Index.Level:
//       characteristic = service.getCharacteristic(Characteristic.CurrentPosition)
//       break;
//
//     case Index.TargetValue:
//       characteristic = service.getCharacteristic(Characteristic.TargetPosition)
//       break;
//
//     case Index.Duration:
//       // not supported by HomeKit
//       break;
//
//     case Index.Inc:
//       // not supported by HomeKit
//       break;
//
//     case Index.Dec:
//       // not supported by HomeKit
//       break;
//
//   }
//
//   characteristic && characteristic
//     .setProps({ valueId })
//     .on('get', cb => get(valueId, cb))
//     .on('set', (value, cb) => set(valueId, value, cb));
}


module.exports = { Index, value }
