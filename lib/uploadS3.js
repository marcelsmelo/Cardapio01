const AWS = require('aws-sdk');
const amazonConfig = require('../config/amazonConfig.js');


module.exports = (params) => {
	logger.debug('[uploadS3]', 'Parametros', params.filename, params.mimetype, params.bucket);
    return new Promise((success, reject) => {
        AWS.config.update({
            accessKeyId: amazonConfig.amazonAccessKeyID,
            secretAccessKey: amazonConfig.amazonSecretAccessKey,
            region: amazonConfig.region
        });

        var s3 = new AWS.S3({
            params: {
                Bucket: params.bucket
            }
        });
        //Enviar imagem diretamente para o serviço Amazon S3 (Imagem sem Otimização)
        let config = {
            Key: params.filename,
            ACL: 'public-read',
            ContentType: params.mimetype,
            Body: params.file
        };

        s3.putObject(config).send((err, data) => {
            if (err){
				logger.error('[uploadS3]', 'Erro ao enviar arquivo ao S3', err);
				reject({
				   success: false
			   })
		   }else{
			   logger.debug('[uploadS3]', 'Arquivo enviado com sucesso ao S3', data);
               success({
                   success: true,
                   url: amazonConfig.baseURL + '/' + params.bucket + '/' + params.filename
               });
		   }
        });
    });
}
