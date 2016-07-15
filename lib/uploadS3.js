const AWS = require('aws-sdk');
const amazonConfig = require('../config/amazonConfig.js');


module.exports = (params)=>{
    return new Promise((success, reject)=>{
        AWS.config.update({
          accessKeyId: amazonConfig.amazonAccessKeyID,
          secretAccessKey: amazonConfig.amazonSecretAccessKey,
          region: amazonConfig.region
        });

        var s3 = new AWS.S3({params: {Bucket: params.bucket}});
        //Enviar imagem diretamente para o serviço Amazon S3 (Imagem sem Otimização)
        let config = {
          Key: params.filename,
          ACL: 'public-read',
          ContentType: params.mimetype,
          Body: params.file

        };

        s3.putObject(config).send((err, data)=>{
          if(err) reject({success: false});
          success({success:true, url: amazonConfig.baseURL+'/'+params.bucket+'/'+params.filename});
        });
    });
}
