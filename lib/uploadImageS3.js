module.exports = (params)=>{
  //Upload criado para upload de imagem usando multer
  //Não utilizado por enquanto
  const fileExtension = params.file.originalname.split('.').pop();

  const config = {
    file: params.file.buffer,
    filename: params.companyID+'_'+params.type+'.'+fileExtension,
    mimetype: params.file.mimetype,
    bucket: 'cardapio01-images'
  }

  //require('../lib/tinifyImageToS3.js')(params);

  return require('../lib/uploadS3.js')(config);
}
