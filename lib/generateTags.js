const Company = require('../models/CompanyModel.js');
const qrCode = require('qr-image');
const fs = require('fs');
const path = require('path');
const htmlPDF = require('html-pdf');
const handlebars = require('handlebars');
const amazonConfig = require('../config/amazonConfig.js');

module.exports = (companyID)=>{

    const qrCodePath = path.join(__dirname, '../../'+ companyID +'.png');
    const code = qrCode.image(JSON.stringify({companyID: companyID}), {type: 'png', size: 10, margin: 0});
    const output = fs.createWriteStream(qrCodePath);
    code.pipe(output);
    logger.debug('[Generate Tags] ', 'qrCodePath', qrCodePath);

    const templatePath = path.join(__dirname, '../QRCodeTag/pdfTemplates/tagsQRCode.html');
    const templateHTML = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateHTML); //Compila o template HTML usando Handlebars
    logger.debug('[Generate Tags] ', 'templatePath', templatePath);

    const tagImagesPath = path.join(__dirname, '../QRCodeTag/images/cardapio01-tags.jpg');
    const data = {qrCode:qrCodePath, infoImage: tagImagesPath};
    const htmlResult = template(data); //Adiciona os dados necessários no template
    logger.debug('[Generate Tags] ', 'tagImagesData', data);

    //Array do opçõs para geração do PDF
    const options = {
      "format": 'A4',
      "base": "file://" //Define o caminho base para busca dos arquivos
    };

    htmlPDF.create(htmlResult, options).toBuffer((err, generatedPdf)=>{
        if (err) logger.error('[Generate Tags]', 'Gerar PDF', err);
        const params = {
            file: generatedPdf,
            filename : companyID+'_tags.pdf',
            mimetype: 'application/pdf',
            bucket: amazonConfig.fileBucket
        }
        require('../lib/uploadS3.js')(params)
        .then((success)=>{
            logger.debug('[Generate Tags]', 'Retorno S3', success);
          return new Promise((accept, reject)=>{
              Company.update({_id: companyID}, {$set: {tags: success.url}})
              .then((company)=>{
                  logger.debug('[Generate Tags]', 'Salvar URL Tags', company);
                  success.msg = 'Arquivo de etiquetas criado com sucesso!';
                  accept(success);
              })
              .catch((err)=>{
                  logger.error('[Generate Tags]', 'Erro ao salvar URL Tags', err);
                  reject({success: false, msg: 'Erro ao salvar a URL do arquivo de etiquetas. Tente novamente!'});
              })
          });
        })
        .catch((err) => {
            logger.error('[Generate Tags]', 'Erro ao salvar Tags S3', err);
            return new Promise((success, reject)=>{
                err.msg = 'Erro ao criar arquivo de etiquetas. Tente novamente!';
                reject(err);
            });
        });
    });
};
