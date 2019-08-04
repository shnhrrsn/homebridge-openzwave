const camelcase = require('camelcase')
const OpenZWave = require('openzwave-shared');

const driverEvents = require('./driverEvents');
const error = require('./error');
const notification = require('./notification');

function sendEachError(callbacks, errorName) {
  const err = new Error(error[errorName]);
  const sendError = cb => cb(err);
  callbacks.forEach(cbs => cbs.forEach(sendError));
  callbacks.clear();
}

function sendError(callbacks, errorName) {
  const err = new Error(error[errorName]);
  callbacks.forEach(cb => cb(err));
  callbacks.clear();
}

function sendSuccess(callbacks) {
  callbacks.forEach(cb => cb());
  callbacks.clear();
}

class Controller {
  constructor(config, platform) {
    this.config = config;
    this.platform = platform;
    this.nodes = new Map();
    this.valuesMaps = {};
    this.ready = false;
  }

  // public api
  connect() {
    this.driver = new OpenZWave({
      ConsoleOutput: false,
      Logging: false,
      SaveConfiguration: false
      // NetworkKey: this.config.networkKey
    })

    for (const e in driverEvents) {
      this.driver.on(driverEvents[e], (...args) => this[camelcase(`on_${e}`)](...args))
    }

    this.driver.connect(this.config.devicePath);
  }

  disconnect() {
    this.driver.disconnect(this.config.devicePath);
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getNodeValue(valueId, cb) {
    try {
      const value = this.getCachedNodeValue(valueId);
      if (cb) {
        cb(null, value);
        return;
      }

      return value
    } catch (e) {
      if (cb) {
        cb(e);
        return;
      }

      throw e;
    }
  }

  setNodeValue(valueId, value, cb) {
    try {
      const valueMaps = this.valuesMaps[valueId];
      if (valueMaps && valueMaps.in) {
        value = valueMaps.in(value);
      }

      const oldValue = this.getCachedNodeValue(valueId);
      if (oldValue !== undefined && oldValue.value === value) {
        cb();
        return;
      }

      const args = valueId.split('-').map(Number).concat(value);
      const node = this.nodes.get(args[0]);
      this.driver.setValue.apply(this.driver, args);
      if (cb) {
        const cbs = node.callbacks.get(valueId);
        if (!cbs) {
          node.callbacks.set(valueId, new Set([ cb ]));
        } else {
          cbs.add(cb);
        }
      }
    } catch (e) {
      console.log('set node value error', e);
      if (cb) {
        cb(e);
        return;
      }

      throw e;
    }
  }

  getDriverStatistics() {
    return this.driver.getDriverStatistics();
  }

  getControllerNodeId() {
    return this.driver.getControllerNodeId();
  }

  getSUCNodeId() {
    return this.driver.getSUCNodeId();
  }

  healNetwork() {
    this.driver.healNetwork();
  }

  healNetworkNode(nodeId, doReturnRoutes) {
    this.driver.healNetworkNode(nodeId, doReturnRoutes);
  }

  isNodeReady(nodeId) {
    return this.nodes.get(nodeId).ready;
  }

  requestAllConfigParams(nodeId) {
    this.driver.requestAllConfigParams(nodeId);
  }

  requestConfigParam(nodeId, paramId) {
    this.driver.requestConfigParam(nodeId, Number(paramId))
  }

  setConfigParam(nodeId, paramId, paramValue, size) {
    this.driver.setConfigParam(nodeId, Number(paramId), paramValue, size)
  }
  //----

  // private
  getCachedNodeValue(valueId) {
    const nodeId = Number(valueId.split('-')[0]);
    const node = this.nodes.get(nodeId);
    if (!node) {
      const err = new Error(error.NODE_NOT_FOUND);
      err.nodeId = nodeId;
      throw err;
    }

    const value = node.values.get(valueId);
    if (!value) {
      const err = new Error(error.VALUE_NOT_FOUND);
      err.valueId = valueId;
      throw err;
    }

    return value;
  }

  onFailed(...args) {
    this.platform.onFailed && this.platform.onFailed(...args);
  }

  onReady(...args) {
    this.platform.onReady && this.platform.onReady(...args);
  }

  onScanComplete(...args) {
    this.platform.onScanComplete && this.platform.onScanComplete(...args);
    this.ready = true;
  }

  onNodeAdded(nodeId) {
    const node = this.updateNodeData(nodeId, {
      id: nodeId,
      ready: false,
      available: false,
      values: new Map(),
      classes: new Map(), // values index by classes
      callbacks: new Map() // set value callbacks
    });

    this.platform.onNodeAdded && this.platform.onNodeAdded(node);
  }

  onNodeAvailable(nodeId, nodeInfo) {
    const node = this.updateNodeData(nodeId, nodeInfo, { available: true });
    this.platform.onNodeAvailable && this.platform.onNodeAvailable(node);
  }

  onNodeRemoved(nodeId) {
    const node = this.nodes.get(nodeId);
    this.nodes.delete(nodeId);
    this.platform.onNodeRemoved && this.platform.onNodeRemoved(node);
  }

  onNodeReady(nodeId) {
    const node = this.updateNodeData(nodeId, { ready: true });
    this.platform.onNodeReady && this.platform.onNodeReady(node);
  }

  onNodePooling(nodeId) {
    const node = this.nodes.get(nodeId);
    this.platform.onNodePooling && this.platform.onNodePooling(node);
  }

  onSceneEvent(nodeId, sceneId) {
    const node = this.nodes.get(nodeId);
    this.platform.onSceneEvent && this.platform.onSceneEvent(node, sceneId);
  }

  onNodeEvent(nodeId, data) {
    const node = this.nodes.get(nodeId);
    this.platform.onNodeEvent && this.platform.onNodeEvent(node, data);
  }

  onValueAdded(nodeId, commandClass, value) {
    const node = this.nodes.get(nodeId);
    const newValue = this.updateNodeValue(nodeId, value);

    let commandClassValues = node.classes.get(commandClass)
    if (!commandClassValues) {
      commandClassValues = new Set();
      node.classes.set(commandClass, commandClassValues);
    }
    commandClassValues.add(newValue.value_id);

    this.platform.onValueAdded && this.platform.onValueAdded(nodeId, commandClass, newValue);
  }

  onValueChanged(nodeId, commandClass, value) {
    const newValue = this.updateNodeValue(nodeId, value);

    if (!this.isNodeReady(nodeId)) {
      return
    }

    this.platform.onValueChanged && this.platform.onValueChanged(nodeId, commandClass, newValue);
  }

  onValueRefreshed(nodeId, commandClass, value) {
    this.platform.onValueRefreshed && this.platform.onValueRefreshed(nodeId, commandClass, value);
  }

  onValueRemoved(nodeId, commandClass, instance, index) {
    const valueId = `${nodeId}-${commandClass}-${instance}-${index}`;
    const removedValue = this.removeNodeValue(nodeId, valueId);
    this.platform.onValueRemoved && this.platform.onValueRemoved(nodeId, removedValue);
  }

  onControllerCommand(...args) {
    this.platform.onControllerCommand && this.platform.onControllerCommand(...args);
  }

  onNotification(nodeId, notificationCode) {
    const node = this.nodes.get(nodeId);

    switch (notificationCode) {
      case notification.TIMEOUT:
        node && sendEachError(node.callbacks, 'TIME_OUT');
        break;

      case notification.NODE_DEAD:
        node && sendEachError(node.callbacks, 'DEAD');
        break;
    }

    this.platform.onNotification && this.platform.onNotification(node, notificationCode);
  }

  updateNodeData(nodeId, ...args) {
    const nodeData = this.nodes.get(nodeId);
    const newNodeData = Object.assign({}, nodeData, ...args);
    this.nodes.set(nodeId, newNodeData);
    return newNodeData;
  }

  updateNodeValue(nodeId, value, ...args) {
    const node = this.nodes.get(nodeId);
    const values = node.values;
    const valueId = value.value_id;

    const valueMaps = this.valuesMaps[valueId];
    if (valueMaps && valueMaps.out) {
      value.value = valueMaps.out(value.value);
    }

    const newValue = Object.assign({}, values.get(valueId), value, ...args);
    values.set(valueId, newValue);

    const callbacks = node.callbacks.get(valueId);
    callbacks && sendSuccess(callbacks);
    return newValue;
  }

  removeNodeValue(nodeId, valueId) {
    const node = this.nodes.get(nodeId);
    const callbacks = node.callbacks.get(valueId);
    callbacks && sendError(callbacks, 'VALUE_NOT_FOUND');
    node.callbacks.delete(valueId);

    const removedValue = node.values.get(valueId);
    node.values.delete(valueId);

    const commandClassValues = node.classes.get(removedValue.class_id);
    commandClassValues.delete(valueId);

    return removedValue;
  }

  setValuesMap(valueId, map) {
    this.valuesMaps[valueId] = map;
  }

  //debug purposes
  printNodeValues(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) {
      console.log(`No node ${nodeId} found`);
      return
    }

    console.log(`${node.manufacturer} (${node.manufacturerid})`);
    console.log(`${node.product} (${node.productid})`);
    console.log(`${node.type} (${node.producttype})`);

    [ ...node.values.values() ]
      .sort((a, b) => {
        if (a.value_id < b.value_id) {
          return -1;
        }

        if (a.value_id > b.value_id) {
          return 1;
        }

        return 0;
      })
      .forEach(value => {
        console.log(`[${value.value_id}] ${value.label} ${value.value} (${value.values || value.units || value.type })`);
      });
  }
}


module.exports = Controller
