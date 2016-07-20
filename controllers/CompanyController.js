const Company = require('../models/CompanyModel.js');

module.exports = {

  get: (req, res, next) =>{
    let companyID = req.companyID;
    Company.findOne({_id: companyID}).lean()
    .then((company)=>{
        res.status(200).json({success: true, company: company})
    })
    .catch((err)=>{//Caso algum erro ocorra
        res.status(500).json({success: false, msg: 'Erro ao buscar os dados da companhia!', company: null});
    });
  },

  edit: (req, res, next) =>{
    //Pegar dados da compania logada, via token
    const companyID = req.companyID;

    // Usando o findOneAndUpdate não é possível pois não é alterado o password nesse Caso
    // Impossibilitando o update (findOneAndUpdate) pois os campos são required
    //Altera todos dados da compania logada
    //Não é alterado password nesse momento

    const companyUpd = {
      name: req.body.name ,
      email: req.body.email  ,
      cpnj: req.body.cpnj ,
      phone: req.body.phone,
      address: req.body.address,
      social: req.body.social,
    };


    Company.update({_id: companyID}, {$set: companyUpd})
    .then((companyMod)=>{//Caso a companhia seja alterada com sucesso, a retorna ao cliente
        //Como foi realizada uma alteração nos dados do usuário, um novo token é gerado
        //cria o token com validade de 24h
        require('../lib/generateJWT.js')(companyMod)
        .then((success)=>{
          res.status(200).json(success);
        })
        .catch((err) => {
          err.msg = "Erro ao modificar senha. Tente novamente!";
          res.status(500).json(err);
        })

    })
    .catch((err)=>{//Caso aconteca algum erro na edição
        res.status(500).json({success: false, token: null, msg: 'Erro ao editar Empresa. Tente novamente!'});
    });
  },

  changePassword: (req, res, next) =>{
    //Pegar dados da compania logada, via token
    const companyID = req.companyID;
    let fields = {email:1,password: 1};

    Company.findOne({_id: companyID}, fields)
    .then((company)=>{
          if(!company){//Não foi encontrado companhia com o name passado
            res.status(500).json({success: false, token: null, msg: 'A autenticação falhou. Empresa não encontrada!'});
          }else{
            company.comparePassword(req.body.oldPassword, (err, isMatch)=>{
              if(isMatch && !err){//Caso a senha passada esteja correta
                  //Altera somente o password da compania logada
                  Company.findOneAndUpdate({_id: companyID}, {password: req.body.newPassword})
                  .then((companyMod)=>{//Caso a companhia seja alterada com sucesso, a retorna ao cliente
                    if(companyMod){
                        require('../lib/generateJWT.js')(companyMod)
                        .then((success)=>{
                          success.msg = "Senha alterada com sucesso!";
                          res.status(200).json(success);
                        })
                        .catch((err) => {
                          err.msg = "Erro ao alterar senha. Tente novamente!";
                          res.status(500).json(err);
                        });
                    }else{
                      res.status(500).json({success: false, token: null, msg:"Erro ao alterar a senha. Tente novamente!" });
                    }
                  })
                  .catch((err)=>{//Caso aconteca algum erro na edição
                      res.status(500).json({success: false, token: null, msg: 'Atualização da senha falhou. Tente novamente!'});
                  });
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

  changeStatus: (req, res, next) =>{
    const companyID = req.companyID;

    Company.update({_id: companyID}, {$set: {status: req.body.status}})
    .then((item)=>{
      res.status(200).json({success: true, msg: 'Status da Empresa alterado com sucesso!'});
    })
    .catch((err)=>{
      res.status(500).json({success: false, msg: 'Erro ao atulizar o Status da Empresa. Tente novamente!'});
    });
  },

  uploadLogo: (req, res, next)=>{
    require('../lib/uploadImageS3.js')(req.companyID, 'logo', req.body.image)
    .then((success)=>{
        Company.update({_id: req.companyID}, {$set: {'images.logo': success.url}})
        .then((company)=>{
            success.msg = 'Banner da empresa enviado com sucesso!';
            res.status(200).json(success);
        })
        .catch((errBD)=>{
            res.status(500).json({success: false, msg: 'Erro ao salvar a URL do logo. Tente novamente!'});
        })
    })
    .catch((err) => {
      err.msg = 'Erro ao enviar o logo da empresa. Tente novamente!';
      res.status(500).json(err);
    })
  },

  uploadBanner: (req, res, next)=>{
    require('../lib/uploadImageS3.js')(req.companyID, 'banner', req.body.image)
    .then((success)=>{
        Company.update({_id: req.companyID}, {$set: {'images.banner': success.url}})
        .then((company)=>{
            success.msg = 'Banner da empresa enviado com sucesso!';
            res.status(200).json(success);
        })
        .catch((err)=>{
            res.status(500).json({success: false, msg: 'Erro ao salvar a URL do logo. Tente novamente!'});
        })
    })
    .catch((err) => {
      err.msg = 'Erro ao enviar o Banner da empresa. Tente novamente!';
      res.status(500).json(err);
    })
  },

}
