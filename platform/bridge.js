const EventEmitter = require('events');

module.exports = class Bridge extends EventEmitter {
  constructor(platform) {
    super();
    this.platform = platform;
  }

  setValue(valueId, newValue, cb) {
    this.platform.setNodeValue(valueId, newValue, cb);
  }

  getValue(valueId, cb) {
    this.platform.getNodeValue(valueId, (err, value) =>
      cb(err, value.value)
    );
  }

  onValueChanged(valueId, cb) {
    this.on(`value.${valueId}.changed`, cb);
  }

  offValueChnaged(valueId, cb) {
    this.off(`value.${valueId}.changed`, cb);
  }
}
