const repl = require('repl');
const Controller = require('../zwave/controller');
const notification = require('../zwave/notification');
const Events = require('../zwave/Events');

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

function onNodeAdded(nodeId) {
  console.log('Node added', nodeId);
}

function onNodeRemoved(nodeId) {
  console.log('Node removed', nodeId);
}

function onNodeEvent(node, data) {
  console.log('Node event', node, data);
}

function onValueChanged(nodeId, commandClass, value) {
  console.log('Node value canged', value);
}

function onNotification(node, notificationCode) {
  const nodeId = node ? node.id : '';

  switch (notificationCode) {
    case notification.MESSAGE_COMPLETE:
      console.log('node message complete', nodeId);
      break;
    case notification.TIMEOUT:
      console.log('node timeout', nodeId);
      break;
    case notification.NOP:
      console.log('node nop', nodeId);
      break;
    case notification.NODE_AWAKE:
      console.log('node awake', nodeId);
      break;
    case notification.NODE_SLEEP:
      console.log('node sleep', nodeId);
      break;
    case notification.NODE_DEAD:
      console.log('node dead', nodeId);
      break;
    case notification.NODE_ALIVE:
      console.log('node alive', nodeId);
      break;

    default:
      console.log(`notofication code ${notificationCode} for node ${nodeId}`);
  }
}

controller = new Controller({ devicePath }, {
  onNodeAdded,
  onNodeRemoved,
  onNodeEvent,
  onValueChanged,
  onScanComplete,
  onNotification
});

controller.driver.on(Events.CONTROLLER_COMMAND, (nodeId, value, state, msg) =>
  console.log(`controller command ${msg} node ${nodeId}, value ${value}, state ${state}`)
)

console.log('Connecting to', devicePath, '\n');
controller.connect();

