const amazonConfig = require('../config/amazonConfig.js');
const tinify = require('tinify');

module.exports = (params) => {
    logger.debug('[tinifyImageToS3]', 'COmprimir imagem e enviar ao S3...');
    //return Promise((success, reject)=>{

    //Otimizando o tamanho da imagem com tinify
    tinify.key = amazonConfig.tinifyKey;

    tinify.fromBuffer(params.file.buffer).store({
        service: 's3',
        aws_access_key_id: amazonConfig.amazonAccessKeyID,
        aws_secret_access_key: amazonConfig.amazonSecretAccessKey,
        region: 'sa-east-1',
        path: params.bucket + '/' + params.filename
    })

}