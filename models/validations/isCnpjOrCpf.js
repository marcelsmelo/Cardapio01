module.exports = (value) => {
  let isCpf = require('./isCpf')(value);
  let isCnpj = require('./isCnpj.js')(value);
  if(isCpf || isCnpj)
      return true
  return false;
}
