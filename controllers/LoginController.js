'use strict';

const Company = require('../models/CompanyModel.js');

module.exports = {
  //Cadastra uma nova empresa
  signup:(req, res, next)=>{
    if(!req.body.name || !req.body.password){//email and password not passed
      res.status(404).json({success: false});
    }else{
      let newCompany = new Company(req.body);
      newCompany.save()
      .then((company)=>{//Usuário criado com sucesso
          res.status(200).json({success: true, data: company});//retorna o usuário criado
      })
      .catch((err)=>{//Algum erro durante a criação
          res.status(404).json({success: false});
      });
    }
  },

  //Realiza o login da empresa no sistema admin
  login: (req, res, next)=> {
    Company.findOne({name: req.body.name},{name: 1, email:1, phone: 1, password: 1})
    .then((company)=>{
          if(!company){//Não foi encontrado companhia com o name passado
            res.json({success: false, msg: 'Authentication failed. User not found!'});
          }else{
            company.comparePassword(req.body.password, (err, isMatch)=>{
              if(isMatch && !err){//Caso a senha passada esteja correta
                company.password = undefined;//Remove o campo senha do token gerado
                let token = require('../lib/generateJWT.js')(company);//Gera o JWT
                res.json({success: true, token: token});
              }else {//Senha não corresponde com a cadastrada
                res.json({success: false, msg: 'Authentication failed. Wrong Password!'})
              }
            });
          }
      })
      .catch((err)=>{//Erro ao buscar usuário e/ou senha
          res.status(404).json({success: false, msg: 'Authentication failed. User or password invalid!'});
      });
  },

  //Realiza o logout da empresa do sistema admin
  logout: (req, res, next) => {
    const company = req.companyDecoded;//Recupera a empresa logada pelo token passado

    //Invalida o token cadastrado para a empresa.
    User.findOneAndUpdate({_id: user._id}, {accessToken: null})
    .then((data) =>{
        res.status(200).json({success: true});
    })
    .catch((err) =>{
        res.status(404).json({success: false});
    });
  },

};
