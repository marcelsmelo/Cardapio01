module.exports = (params)=>{
  //Pegar dados da compania logada, via token
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
