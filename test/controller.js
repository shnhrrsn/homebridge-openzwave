const test = require('ava');
const Controller = require('../zwave/controller');

let ctrl;

test.before.cb(t => {
  ctrl = new Controller({
    devicePath: process.env.Z_DEVICE_PATH
  }, {
    onScanComplete: () => t.end()
  });
});

test.cb('state: get/set node value', t => {
  t.end();
})
