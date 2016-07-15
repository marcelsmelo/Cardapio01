  const amazonConfig = require('../config/amazonConfig.js');
  module.exports = (companyID, imageB64)=>{
  const base64Image = imageB64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

  const fileMimetype = base64Image[1];
  const decodedImage = new Buffer(base64Image[2], 'base64');

  const params = {
    file: decodedImage,
    filename: companyID+'_logo.png',
    mimetype: fileMimetype,
    bucket: amazonConfig.imageBucket
  }
  //require('../lib/tinifyImageToS3.js')(params);

  return require('../lib/uploadS3.js')(params);
}
