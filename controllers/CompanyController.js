const Company = require('../models/CompanyModel.js');
const qrCode = require('qr-image');
const fs = require('fs');
const path = require('path');
const htmlPDF = require('html-pdf');
const handlebars = require('handlebars');
const config = require('../config/config.js');
const jwt  = require('jsonwebtoken');


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
      phone: req.body.phone ? JSON.parse(req.body.phone): undefined,
      address: req.body.address ? JSON.parse(req.body.address): undefined,
      social: req.body.social ? JSON.parse(req.body.social): undefined,
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

  generateTags: (req, res, next) =>{

    //Pegar dados da compania logada, via token
    const companyID = req.companyID;

    const qrCodePath = path.join(__dirname, '../../'+ companyID +'.png');
    const code = qrCode.image(JSON.stringify({companyID: companyID}), {type: 'png', size: 10, margin: 0});
    const output = fs.createWriteStream(qrCodePath);
    code.pipe(output);

    const templatePath = path.join(__dirname, '../QRCodeTag/pdfTemplates/tagsQRCode.html');
    const templateHTML = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateHTML); //Compila o template HTML usando Handlebars

    const tagImagesPath = path.join(__dirname, '../QRCodeTag/images/cardapio01-tags.jpg');
    const data = {qrCode:qrCodePath, infoImage: tagImagesPath};
    const htmlResult = template(data); //Adiciona os dados necessários no template

    //Array do opçõs para geração do PDF
    const options = {
      "format": 'A4',
      "base": "file://" //Define o caminho base para busca dos arquivos
    };

    htmlPDF.create(htmlResult, options).toStream((err, pdf)=>{
      res.setHeader('Content-disposition', 'inline; filename="teste"');
      res.setHeader('Content-type', 'application/pdf');
      fs.unlink(qrCodePath);
      pdf.pipe(res);
    });

    // const reportPath = path.join(__dirname, '../public/files/'+companyID+'-tags.pdf');
    // //Criar o PDF com o HTML compilado com os dados
    // htmlPDF.create(htmlResult, options).toFile(reportPath, (err, pdf)=>{
    //   if(err){
    //     return res.status(500).json({success: false, msg: 'Erro ao gerar etiquetas. Tente novamente!'});
    //   }
    //   res.download(reportPath, 'QRCodeTags.pdf');
      //FIXME Encontrar uma forma de entregar o PDF ao usuário
      //FIXME Apagar o pdf após entregar ao usuário (economia de espaço)
      //Em caso de sucesso, retorna a url de acesso ao pdf
      //return res.status(200).json({success:true, msg:'Etiquetas geradas com sucesso!', url: '/files/'+companyID+'-etiquetas.pdf'});
    //});
  },

  //FIXME Retirar exemplo de upload de imagem do arquivo app.js e mover para companycontroller

  uploadLogo: (req, res, next)=>{
    //Pegar dados da compania logada, via token
    const companyID = req.body.companyID;
    const fileExtension = req.file.originalname.split('.').pop();

    const params = {
      file: req.file,
      filename: companyID+'_logo.'+fileExtension,
      bucket: 'cardapio01'
    }

    //require('../lib/tinifyImageToS3.js')(params);

    require('../lib/uploadS3.js')(params)
    .then((success)=>{
      console.log('SUCCESS', success);
      res.status(200).json({success: true, msg: 'Logo da empresa enviado com sucesso!'});
    })
    .catch((err) => {
      console.log('ERR', err);
      res.status(200).json({success: true, msg: 'Erro ao enviar o logo da empresa. Tente novamente!'});
    })


  },

}
