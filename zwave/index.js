module.exports = [

  'switchMultiLevel',
  'switchBinary'

].reduce((m, name) => {
  const cls = require(`./classes/${name}`);
  m[cls.id] = cls;
  return m;
}, {});
