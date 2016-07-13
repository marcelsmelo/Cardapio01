const AWS = require('aws-sdk');
const amazonConfig = require('../config/amazonConfig.js');

module.exports = (params)=>{
    return new Promise((success, reject)=>{
        AWS.config.update({
          accessKeyId: amazonConfig.amazonAccessKeyID,
          secretAccessKey: amazonConfig.amazonSecretAccessKey,
          region: 'sa-east-1'
        });

        var s3 = new AWS.S3({params: {Bucket: params.bucket}});

        //Enviar imagem diretamente para o serviço Amazon S3 (Imagem sem Otimização)
        let config = {
          Key: params.filename,
          ACL: 'public-read',
          ContentType: params.file.minetype,
          //ContentLength: params.file.size,
          Body: params.file.buffer

        };

        s3.putObject(config).send((err, data)=>{
          if(err){
            console.log('ERR', err);
            reject(err);
          }
          else{
            console.log('DATA', data);
            success({data: data});
          }
        });
    });
}
