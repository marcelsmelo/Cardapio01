'use strict';

const config = require('../config/config.js');
const jwt  = require('jsonwebtoken');
const Company = require('../models/CompanyModel.js');


module.exports = (company)=>{
  return new Promise((success, reject)=>{
      //cria o token com validade de 24h
      let token = jwt.sign({_id: company._id}, config.secret, {
        expiresIn: 14400 //(seconds) 24h
      });
      //Salva o Token criado para conferencia
      Company.update({_id: company._id}, {$set: {accessToken: token}})
      .then((companyMod)=>{//É retornado o token salvo no BD
          success({success: true, token: token});
      })
      .catch((err)=>{//Caso algum erro ocorra, inviabiliza o token
          reject({success: false, token: null, msg: "Erro ao autenticar. Tente novamente!"});
      });
  });
}
