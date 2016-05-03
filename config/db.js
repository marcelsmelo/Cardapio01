module.exports = (mongoose) =>{
  const user = 'msmelo';
  const pass = 'm4rc3lsm';
  const url = 'mongodb://'+user+':'+pass+'@ds021771.mlab.com:21771/cardapio01';
  mongoose.connect(url);
}
