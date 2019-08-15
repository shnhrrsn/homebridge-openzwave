const { PLUGIN_NAME, PLATFORM_NAME } = require('../constants');
const { createAccessory, configureAccessory } = require('./accessory');
const Bridge = require('./bridge');

const Controller = require('../zwave/controller');
const Notification = require('../zwave/notification');

const { name, version } = require('../package.json');

const { getNodeConfig } = require('../util');

class Platform {
  constructor(log, config, api) {
    this.log = log;
    this.api = api;

    this.readyNodes = new Set(); // to avoid adding the same node twice
    this.accessories = new Map();
    this.accessoryConfigs = config.accessories || {};

    this.bridge = new Bridge(this);
    this.createController(config.zwave);

    // to prevent configureAccessory geeting called after node ready
    api.on('didFinishLaunching', () => setTimeout(() => this.init(), 16));
  }

  createController(config) {
    this.controller = new Controller(config, {
      onFailed: e => this.onConstrollerFailed(e),
      onReady: () => this.onConstrollerReady(),
      onScanComplete: () => this.onScanComplete(),
      onNodeAdded: nodeId => this.onNodeAdded(nodeId),
      onNodeAvailable: (...args) => this.onNodeAvailable(...args),
      onNodeRemoved: nodeId => this.onNodeRemoved(nodeId),
      onNodeReady: node => this.onNodeReady(node),
      onNodePooling: (...args) => this.onNodePooling(...args),
      onSceneEvent: (...args) => this.onSceneEvent(...args),
      onNodeEvent: (...args) => this.onNodeEvent(...args),
      onValueChanged: (...args) => this.onNodeValueChanged(...args),
      onNotification: (...args) => this.onNotification(...args)
    });
  }

  init() {
    this.controller.connect();
  }

  configureAccessory(accessory) {
    this.accessories.set(accessory.UUID, accessory);
  }

  onConstrollerFailed(e) {
    this.controller && this.controller.disconect();
    this.log.error('Failed to setup Z-Wave network constroller', e);
  }

  onConstrollerReady(homeid) {
    this.log.info('Controller ready. Scanning...', homeid || '');
  }

  onScanComplete() {
    this.log.info('Z-Wave network scan complete');
  }

  onNodeAdded(node) {
    this.log.debug('node added', node.id);
  }

  onNodeAvailable(node) {
    this.log.debug('node available', node.id);
  }

  onNodeRemoved(node) {
    this.log.debug('node removed', node.id);
    this.removeAccessory(node);
  }

  onNodeReady(node) {
    this.log.debug('node ready', node.id);
    this.initNode(node);

    if (node.id === this.controller.getControllerNodeId()) {
      this.initControllerNode(node);
    }
  }

  onNodePooling(node) {
    this.log.debug('node pooling', node.id);
  }

  onNodeValueChanged(nodeId, commandClass, value) {
    this.bridge.emit(`value.${value.value_id}.changed`, value.value);
    this.log.debug('node value changed', nodeId, commandClass, value.value);
  }

  onSceneEvent(...args) {
    this.log.debug('scene event', ...args);
  }

  onNodeEvent(...args) {
    this.log.debug('Node event', ...args);
  }

  onNotification(node, notificationCode) {
    const nodeId = node ? node.id : '';

    switch (notificationCode) {
      case Notification.MESSAGE_COMPLETE:
        this.log.debug('node message complete', nodeId);
        break;
      case Notification.TIMEOUT:
        this.log.debug('node timeout', nodeId);
        break;
      case Notification.NOP:
        this.log.debug('node nop', nodeId);
        break;
      case Notification.NODE_AWAKE:
        this.log.debug('node awake', nodeId);
        break;
      case Notification.NODE_SLEEP:
        this.log.debug('node sleep', nodeId);
        break;
      case Notification.NODE_DEAD:
        this.log.debug('node dead', nodeId);
        break;
      case Notification.NODE_ALIVE:
        this.log.debug('node alive', nodeId);
        break;

      default:
        this.log.debug(`notofication code ${notificationCode} for node ${nodeId}`);
    }
  }

  getNodeValue(valueId, cb) {
    this.log.debug('get node value', valueId);
    this.controller.getNodeValue(valueId, cb);
  }

  setNodeValue(valueId, value, cb) {
    this.log.debug('set node value', valueId, value);
    this.controller.setNodeValue(valueId, value, cb);
  }

  setNodeValues(node, values) {
    if (!values) {
      return
    }

    for (const valueId in values) {
      this.setNodeValue(`${node.id}-${valueId}`, values[valueId]);
    }
  }

  setNodeParameters(node, parameters) {
    if (!parameters) {
      return
    }

    const controller = this.controller;
    const nodeId = node.id;

    const setConfigParam = (nodeId, pId, pValue) => {
      try {
        const parameter = controller.getNodeValue(`${nodeId}-112-1-${pId}`);
        if (parameter.value !== pValue) {
          controller.setConfigParam(nodeId, pId, pValue);
          this.log.info(`Changed node ${nodeId} config parameter ${pId} from ${parameter.value} to ${pValue}`);
        }
      } catch (e) {
        this.log.error(`Can not set the node ${nodeId} parameter ${pId}`, e);
      }
    }

    Object.entries(parameters).forEach(([ pId, pValue ]) => {
      controller.requestConfigParam(nodeId, pId);
      setTimeout(() => setConfigParam(nodeId, pId, pValue), 1000);
    });
  }

  setNodeValuesMaps(node, valuesMaps) {
    if (!valuesMaps) {
      return
    }

    for (const valueId in valuesMaps) {
      this.controller.setValuesMap(`${node.id}-${valueId}`, valuesMaps[valueId]);
    }
  }

  initNode(node) {
    if (this.readyNodes.has(node.id) || this.accessoryConfigs[node.id] === false) {
      return
    }

    this.readyNodes.add(node.id);
    const deviceConfig = getNodeConfig(node);
    const config = {
      ...deviceConfig,
      ...this.accessoryConfigs[node.id]
    }

    this.setNodeValues(node, config.values);
    this.setNodeParameters(node, config.parameters);
    this.setNodeValuesMaps(node, config.valuesMaps);

    const id = this.getAccessoryId(node);
    const accessory = this.accessories.get(id);
    this.log.info(`Node ${id} => accessory ${id} ${config.name ? `(${config.name})` : ''}`);
    if (accessory) {
      this.updateAccessory(node, config, accessory);
      return;
    }

    this.createAccessory(node, config, id);
  }

  updateAccessory(node, config, accessory) {
    const { Service, Characteristic } = this.api.hap;

    configureAccessory({
      Service,
      Characteristic,
      bridge: this.bridge,
      accessory,
      node,
      config
    });
  }

  createAccessory(node, config, id) {
    const accessory = createAccessory({
      log: this.log,
      api: this.api,
      bridge: this.bridge,
      id, node, config
    });

    this.accessories.set(id, accessory);
    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [ accessory ]);
  }

  removeAccessory(node) {
    this.readyNodes.delete(node.id);
    const id = this.getAccessoryId(node);
    const accessory = this.accessories.get(id);

    if (!accessory) {
      return
    }

    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [ accessory ])
    this.accessories.delete(id);
  }

  getAccessoryId({ id, manufacturerid, producttype, productid }) {
    return this.api.hap.uuid.generate(`${manufacturerid}-${producttype}-${productid}-${id}`);
  }

  identify() {
    this.log.info(`${name} ${version}`);
    this.log.info(`Node ${process.version}, Homebridge ${this.api.serverVersion}`);
  }

  initControllerNode(node) {
    const id = this.getAccessoryId(node);
    const accessory = this.accessories.get(id);

    this.createControllerButton(accessory, 'Add Node', 'addNode', [ false ]);
    this.createControllerButton(accessory, 'Add Secure Node', 'addNode', [ true ]);
    this.createControllerButton(accessory, 'Remove Node', 'removeNode');
  }

  createControllerButton(accessory, title, command, args = []) {
    const { Service, Characteristic } = this.api.hap;

    let button = accessory.getService(title);
    if (!button) {
      button = new Service.Switch(title, title.toLowerCase());
      accessory.addService(button);
    }

    let state = false;
    const on = button.getCharacteristic(Characteristic.On)
      .on('get', cb => cb(null, state))
      .on('set', (value, cb) => {
        if (value && !state) {
          state = true;
          return this.controller[command](...args, {
            onWaiting: () => {
              state = true;
              cb();
            },

            onEnd: err => {
              state = false;

              if (err) {
                return cb(err);
              }

              on.updateValue(false)
            }
          });
        }

        if (!value && state) {
          this.controller.cancelControllerCommand();
          return cb();
        }
      });
  }
}


module.exports = Platform
