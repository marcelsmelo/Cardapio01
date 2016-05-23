'use strict';

const Company = require('../models/CompanyModel.js');
const qrCode = require('qr-image');
const fs = require('fs');
const path = require('path');
const htmlPDF = require('html-pdf');
const handlebars = require('handlebars');
const config = require('../config/config.js');
const jwt  = require('jsonwebtoken');

module.exports = {

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

        let token = jwt.sign({_id: companyID}, config.secret, {
          expiresIn: 14400 //(seconds) 24h
        });

        //Salva o Token criado para conferencia
        Company.update({_id: companyID}, {$set: {accessToken: token}})
        .then((companyUpdated)=>{//É retornado o token salvo no BD
            res.status(200).json({success: true, token: token});
        })
        .catch((err)=>{//Caso algum erro ocorra, inviabiliza o token
            res.status(404).json({success: false, token: null, err: err});
        });

    })
    .catch((err)=>{//Caso aconteca algum erro na edição
        res.status(404).json({success: false, err: err});
    });
  },

  changePassword: (req, res, next) =>{
    //Pegar dados da compania logada, via token
    const companyID = req.companyID;

    //Altera somente o password da compania logada
    Company.update({_id: companyID}, {$set:{password: req.body.password}})
    .then((companyMod)=>{//Caso a companhia seja alterada com sucesso, a retorna ao cliente
        //Como foi realizada uma alteração no password, um novo token é gerado

        //cria o token com validade de 24h
        let token = jwt.sign({_id: companyID}, config.secret, {
          expiresIn: 14400 //(seconds) 24h
        });

        //Salva o Token criado para conferencia
        Company.update({_id: companyID}, {$set: {accessToken: token}})
        .then((companyUpdated)=>{//É retornado o token salvo no BD
            res.status(200).json({success: true, token: token});
        })
        .catch((err)=>{//Caso algum erro ocorra, inviabiliza o token
            res.status(404).json({success: false, token: null, err: err});
        });
    })
    .catch((err)=>{//Caso aconteca algum erro na edição
        res.status(404).json({success: false, msg: 'Updated failed!', err: err});
    });
  },

  changeStatus: (req, res, next) =>{
    const companyID = req.companyID;

    Company.update({_id: companyID}, {$set: {status: req.body.status}})
    .then((item)=>{
      res.status(200).json({success: true, data: item});
    })
    .catch((err)=>{
      res.status(404).json({success: false, err: err});
    });
  },

  generateQRCode: (req, res, next) =>{

    //Pegar dados da compania logada, via token
    const companyID = req.companyID;

    const qrCodePath = path.join(__dirname, '../public/qrCodes/'+ companyID +'.png');
    const code = qrCode.image(JSON.stringify({companyID: companyID}), {type: 'png', size: 10, margin: 0});
    const output = fs.createWriteStream(qrCodePath);
    code.pipe(output);

    const templatePath = path.join(__dirname, '../pdfTemplates/etiquetas.html');
    const templateHTML = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateHTML); //Compila o template HTML usando Handlebars

    const data = {qrCode:'qrCodes/'+companyID, infoImage: 'images/cardapio01-etiqueta'};
    const htmlResult = template(data); //Adiciona os dados necessários no template

    //Array do opçõs para geração do PDF
    const options = {
      "format": 'A4',
      "base": "file://"+path.join(__dirname, '../public/') //Define o caminho base para busca dos arquivos
    };

    const reportPath = path.join(__dirname, '../public/files/'+companyID+'-etiquetas.pdf');
    //Criar o PDF com o HTML compilado com os dados
    htmlPDF.create(htmlResult, options).toFile(reportPath, (err, pdf)=>{
      if(err){
        return res.status(404).json({success: true, err:err});
      }
      //FIXME Encontrar uma forma de entregar o PDF ao usuário
      //FIXME Apagar o pdf após entregar ao usuário (economia de espaço)
      //Em caso de sucesso, retorna a url de acesso ao pdf
      return res.status(200).json({success:true, url: pdf});
    });
  },

}
