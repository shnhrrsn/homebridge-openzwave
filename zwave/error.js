module.exports = {
  TIME_OUT: 'TIME_OUT',
  DEAD: 'DEAD',
  NODE_NOT_FOUND: 'NODE_NOT_FOUND',
  VALUE_NOT_FOUND: 'VALUE_NOT_FOUND',
  CONTROLLER_COMMAND_FAILED: 'CONTROLLER_COMMAND_FAILED',
  CONTROLLER_COMMAND_IN_PROGRESS: 'CONTROLLER_COMMAND_IN_PROGRESS',

  Error: (error, data) => {
    const err = new Error(error);
    if (data) {
      Object.assign(err, data);
    }

    return err;
  }
}
