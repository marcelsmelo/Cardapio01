module.exports = (mongoose) =>{
  // const user = 'msmelo';
  // const pass = 'm4rc3lsm';
  // const url = 'mongodb://'+user+':'+pass+'@ds021771.mlab.com:21771/cardapio01';
  const url = 'mongodb://127.0.0.1:27017/cardapio01';
  mongoose.connect(url);
}
