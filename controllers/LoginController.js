const Company = require('../models/CompanyModel.js');
const config = require('../config/config.js');
const jwt  = require('jsonwebtoken');

module.exports = {
  //Cadastra uma nova empresa
  signup:(req, res, next)=>{
    logger.debug('[Login Controller]', 'Dados Signup', req.body);
    //TODO verificar email já existente
    if(!req.body.email || !req.body.password){//email and password not passed
        logger.debug('[Login Controller]', 'Email e/ou senha obrigatórios', req.body);
        res.status(500).json({success: false, msg:"E-mail e/ou Senha obrigatórios. Tente novamente!"});
    }else{
        let newCompany = new Company(req.body);
        newCompany.save()
        .then((company)=>{//Usuário criado com sucesso
            logger.debug('[Login Controller]', 'Empresa salva com sucesso', company);
            res.status(200).json({success: true, msg: "Empresa cadastrado com sucesso!"});//retorna o usuário criado
        })
        .catch((err)=>{//Algum erro durante a criaçãos
            logger.error('[Login Controller]', 'Erro ao cadastrar Empresa', err);
            res.status(500).json({success: false, msg: "Erro ao cadastrar nova empresa. Tente novamente!"});
        });
    }
  },

  //Realiza o login da empresa no sistema admin
  login: (req, res, next)=> {
    let fields = {name: 1, email:1, phone: 1, password: 1};
    Company.findOne({email: req.body.email}, fields)
    .then((company)=>{
          if(!company){//Não foi encontrado companhia com o name passado
            res.status(500).json({success: false, token: null, msg: 'A autenticação falhou. Empresa não encontrada!'});
          }else{
            company.comparePassword(req.body.password, (err, isMatch)=>{
              if(isMatch && !err){//Caso a senha passada esteja correta
                require('../lib/generateJWT.js')(company)
                .then((success)=>{
                  res.status(200).json(success);
                })
                .catch((err) => {
                  err.msg = "Erro ao modificar senha. Tente novamente!";
                  res.status(500).json(err);
                })
              }else {//Senha não corresponde com a cadastrada
                res.status(500).json({success: false, token: null, msg: 'A autenticação falhou. Senha incorreta!'})
              }
            });
          }
      })
      .catch((err)=>{//Erro ao buscar usuário e/ou senha
          res.status(500).json({success: false, msg: 'A autenticação falhou. Usuário e/ou Senha incorretos!'});
      });
  },

  //Realiza o logout da empresa do sistema admin
  logout: (req, res, next) => {
    const companyID = req.companyID;//Recupera a empresa logada pelo token passado

    //Invalida o token cadastrado para a empresa.
    Company.update({_id: companyID}, {$set: {accessToken: null}})
    .then((data) =>{
        res.status(200).json({success: true, msg:"Logout realizado com sucesso!"});
    })
    .catch((err) =>{
        res.status(500).json({success: false, msg: "Falha ao realizar o Logout. Tente novamente!"});
    });
  },

  tokenVerify: (req, res, next) =>{
    res.status(200).json({success: true, msg:"Token válido!"});
  },

  recoveryPass: (req, res, next)=>{
    Company.findOneAndUpdate({_id: req.body.companyID}, {password: 'eitacuzao'})
    .then((companyMod)=>{
        res.status(200).json({success: true, msg:"Senha recuperada com sucesso. Verifique seu e-mail!" });
      })
      .catch((err) => {
          res.status(500).json({success: false, msg:"Erro ao buscar dados da empresa. Tente novamente!" });
      })
    }
};
