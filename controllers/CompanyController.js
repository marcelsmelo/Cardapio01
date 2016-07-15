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

    // htmlPDF.create(htmlResult, options).toBuffer((err, pdf)=>{
    //   res.setHeader('Content-disposition', 'attachment; filename="teste"');
    //   res.setHeader('Content-type', 'application/pdf');
    //   res.setHeader('Access-Control-Allow-Origin', '*');
    //   fs.unlink(qrCodePath);
    //   res.end(pdf, 'binary');
    // });

    htmlPDF.create(htmlResult, options).toBuffer((err, pdf)=>{
      const params = {
        file: pdf,
        filename : companyID+'_tags.pdf',
        mimetype: 'application/pdf',
        bucket: 'cardapio01-pdf'
      }
      require('../lib/uploadS3.js')(params)
      .then((success)=>{
        //salvar url no BD
        success.msg = 'Arquivo de etiquetas criado com sucesso!';
        res.status(200).json(success);
      })
      .catch((err) => {
        err.msg = 'Erro ao criar arquivo de etiquetas. Tente novamente!';
        res.status(500).json(err);
      })
    });


  },

  //FIXME Retirar exemplo de upload de imagem do arquivo app.js e mover para companycontroller

  uploadLogo: (req, res, next)=>{
    //const fileExtension = params.file.originalname.split('.').pop();
    const companyID = 'qqrcoisapqnaomuda';
    const image = 'data:image/png;base64,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';
    const base64Image = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    const fileMimetype = base64Image[1];

    var decodedImage = new Buffer(base64Image[2], 'base64');

    const params = {
      file: decodedImage,
      filename: companyID+'_logo.png',
      mimetype: 'image/png',
      bucket: 'cardapio01-images'
    }

    require('../lib/uploadS3.js')(params)
    .then((success)=>{
      //salvar url no BD
      success.msg = 'Logo da empresa enviado com sucesso!';
      res.status(200).json(success);
    })
    .catch((err) => {
      err.msg = 'Erro ao enviar o logo da empresa. Tente novamente!';
      res.status(500).json(err);
    })
  },

  uploadBanner: (req, res, next)=>{
    const params ={
      companyID: req.companyID,
      file: req.file,
      type: 'banner'
    }
    require('../lib/uploadImageS3.js')(params)
    .then((success)=>{
      //salvar url no BD
      success.msg = 'Banner da empresa enviado com sucesso!';
      res.status(200).json(success);
    })
    .catch((err) => {
      err.msg = 'Erro ao enviar o Banner da empresa. Tente novamente!';
      res.status(500).json(err);
    })
  },

}
