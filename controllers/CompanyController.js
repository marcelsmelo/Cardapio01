'use strict';

const Company = require('../models/CompanyModel.js');

module.exports = {

  editCompany: (req, res, next) =>{
    //Pegar dados da compania logada, via token
    const company = req.companyDecoded;

    //Altera todos dados da compania logada
    //Não é alterado password nesse momento
    //{new: true, upsert: false} - Retorna o objeto alterado e não cria um novo objeto caso não exista na busca
    Company.findOneAndUpdate({_id: company._id}, req.body,{new: true, upsert: false})
    .then((companyMod)=>{//Caso a companhia seja alterada com sucesso, a retorna ao cliente
        //Como foi realizada uma alteração nos dados do usuário, um novo token é gerado
        let token = require('../lib/generateJWT.js')(companyMod);
        res.status(200).json({success: true, company: companyMod, token: token});
    })
    .catch((err)=>{//Caso aconteca algum erro na edição
        res.status(404).json({success: false, err: err});
    });
  },

  changePassword: (req, res, next) =>{
    //Pegar dados da compania logada, via token
    const company = req.companyDecoded;

    //Altera somente o password da compania logada
    //{new: true, upsert: false} - Retorna o objeto alterado e não cria um novo objeto caso não exista na busca
    User.findOneAndUpdate({_id: company._id}, {password: req.body.password})
    .then((companyMod)=>{//Caso a companhia seja alterada com sucesso, a retorna ao cliente
        //Como foi realizada uma alteração no password, um novo token é gerado
        let token = require('../lib/generateJWT.js')(companyMod);
        res.status(200).json({success: true, company: companyMod, token: token});
    })
    .catch((err)=>{//Caso aconteca algum erro na edição
        res.status(404).json({success: false, msg: 'Updated failed!', err: err});
    });
  },

}
