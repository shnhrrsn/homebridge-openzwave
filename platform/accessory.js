const { getManufacturer } = require('../util');
const zWaveClasses = require('../zwave');

function configureAccessory({ Service, Characteristic, accessory, bridge, node, config = {} }) {
  const {
    classes: deviceClasses = {},
    ignoreClasses = []
  } = config;
  const nodeValues = node.values;

  node.classes.forEach((values, classId) => {
    if (ignoreClasses.includes(classId)) {
      return;
    }

    const deviceClass = deviceClasses[classId] && deviceClasses[classId].bind;
    const genericClass = zWaveClasses[classId] && zWaveClasses[classId].bind;

    const cls = deviceClass || genericClass;
    if (!cls) {
      return;
    }

    cls({
      Service,
      Characteristic,
      bridge,
      accessory,
      node,
      values: [ ...values ].map(id => nodeValues.get(id))
    });
  });

  return accessory;
}

function createAccessory({ log, api, bridge, id, node, config = {} }) {
  const { platformAccessory: Accessory, hap } = api;
  const { Service, Characteristic } = hap;

  const manufacturer = getManufacturer(node);
  const product = `${node.id} / ${node.product} - ${node.productid}`;
  const accessory = new Accessory(config.name || product, id);

  accessory
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, manufacturer)
    .setCharacteristic(Characteristic.Model, `${node.product} - ${node.productid}`)
    .setCharacteristic(Characteristic.HardwareRevision, node.id);

  log.info(`New accessory: ${id}, ${manufacturer}, ${product}`);

  return configureAccessory({
    Service,
    Characteristic,
    accessory,
    bridge,
    node,
    config
  });
}


module.exports = {
  createAccessory,
  configureAccessory
}
