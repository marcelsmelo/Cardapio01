
const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const Company = require('../models/CompanyModel.js');


module.exports = (req, res, next)=>{

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    Company.findOne({accessToken: token})
    .then((company)=>{
        if(!company){//Não encontre companhia cadastrada com o token passado
            return res.status(404).json({success: false, msg: 'Token invalid!'});
        }
        jwt.verify(token, config.secret, function(err, decoded) {
          if (err) {
            return res.status(404).json({ success: false, msg: 'Failed to authenticate token.' });
          } else {
            // if everything is good, save to request for use in other routes
            //TODO verificar dados com os encontrados no banco
            req.companyDecoded = decoded._doc;
            next();
          }
        });
    })
    .catch((err)=>{//Não seja encontrado um token válido no BD
        return res.status(404).json({success: false, msg: 'Token invalid!'});
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).json({success: false, message: 'No token provided.'});
  }
};
