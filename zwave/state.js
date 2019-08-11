module.exports = {
  NORMAL: 0,      //No command in progress.
  STARTING: 1,    //The command is starting.
  CANCEL: 2,      //The command was canceled.
  ERROR: 3,       //Command invocation had error(s) and was aborted
  WAITING: 4,     //Controller is waiting for a user action.
  SLEEPING: 5,    //Controller command is on a sleep queue wait for device.
  INPROGRESS: 6,  //The controller is communicating with the other device to carry out the command.
  COMPLETED: 7,   //The command has completed successfully.
  FAILED: 8,      //The command has failed.
  NODE_OK: 9,     //Used only with ControllerCommand_HasNodeFailed to indicate that the controller thinks the node is OK.
  NODE_FAILED: 10 //Used only with ControllerCommand_HasNodeFailed to indicate that the controller thinks the node has failed.
}
