module.exports = (req, res, next)=>{
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Methods", "POST");
  res.header("Access-Control-Allow-Methods", "PUT");
  res.header("Access-Control-Allow-Methods", "DELETE");
  res.header("Access-Control-Allow-Methods", "OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", "false");
  next();
};
