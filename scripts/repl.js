const repl = require('repl');
const Controller = require('../zwave/controller');

const devicePath = process.argv[2]
let controller
let r

function onScanComplete() {
  console.log('Scan complete \n');

  if (r) {
    return
  }

  r = repl.start('> ');
  Object.defineProperty(r.context, 'ctrl', {
    configurable: false,
    enumerable: true,
    value: controller
  });

  r.on('exit', () => {
    console.log('Disconnecting...');
    controller.disconnect();
    process.exit();
  })
}

function onControllerCommand(n, rv, st, msg) {
  console.log('Controller commmand feedback: %s node==%d, retval=%d, state=%d', msg, n, rv, st);
}

function onNodeEvent(node, data) {
  console.log('Node event', node, data);
}

function onValueChanged(nodeId, commandClass, value) {
  console.log('Node value canged', value);
}

function onValueRefreshed(nodeId, commandClass, value) {
  console.log('Node value refreshed', value);
}

controller = new Controller({ devicePath }, {
  onNodeEvent,
  onValueChanged,
  onValueRefreshed,
  onScanComplete,
  onControllerCommand
});

console.log('Connecting to', devicePath, '\n');
controller.connect();

