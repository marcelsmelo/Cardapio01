  const amazonConfig = require('../config/amazonConfig.js');
  module.exports = (companyID, type, imageB64) => {
	  logger.debug('[uploadImageS3]', 'Upload da imagem para o S3', companyID, type);

      const base64Image = imageB64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

      const fileMimetype = base64Image[1];
      const decodedImage = new Buffer(base64Image[2], 'base64');
	  const date = new Date().getTime();

      const params = {
              file: decodedImage,
              filename: companyID +'-'+date+ '_' + type + '.png',
              mimetype: fileMimetype,
              bucket: amazonConfig.imageBucket
    	}
		logger.debug('[uploadImageS3]', 'Parametros para S3', params.filename, params.mimetype, params.bucket);
          //require('../lib/tinifyImageToS3.js')(params);

      return require('../lib/uploadS3.js')(params);
  }
