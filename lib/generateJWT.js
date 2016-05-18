'use strict';

const config = require('../config/config.js');
const jwt  = require('jsonwebtoken');
const Company = require('../models/CompanyModel.js');


module.exports = (company)=>{
  //cria o token com validade de 24h
  let token = jwt.sign(company, config.secret, {
    expiresIn: 14400 //(seconds) 24h
  });

  //Salva o Token criado para conferencia
  Company.findOneAndUpdate({_id: company._id}, {accessToken: token})
  .then((companyMod)=>{//É retornado o token salvo no BD
      token = companyMod.accessToken;
      return token ;
  })
  .catch((err)=>{//Caso algum erro ocorra, inviabiliza o token
      token =  null;
      return token;
  });

}
