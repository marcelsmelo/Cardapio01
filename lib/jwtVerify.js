
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
            return res.status(401).json({success: false, msg: 'Token inválido!'});
        }
        jwt.verify(token, config.secret, function(err, decoded) {
          if (err) {
            return res.status(401).json({ success: false, msg: 'Falha ao verificar token de acesso. Tente novamente!' });
          } else {
            // if everything is good, save to request for use in other routes
            //TODO verificar dados com os encontrados no banco
            req.companyID = decoded._id;
            next();
          }
        });
    })
    .catch((err)=>{//Não seja encontrado um token válido no BD
        return res.status(401).json({success: false, msg: 'Token Inválido!'});
    });
  } else {
    // if there is no token
    // return an error
    return res.status(401).json({success: false, message: 'O envio do token é obrigatório!'});
  }
};
