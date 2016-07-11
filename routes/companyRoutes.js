module.exports = (app)=>{
  const controller = app.controllers.CompanyController;
  const JWTPolicy = require('../lib/jwtVerify.js');
  const multerConfig = require('../lib/multerConfig.js');

  app.post('/company/get', JWTPolicy, controller.get);
  app.post('/company/edit', JWTPolicy, controller.edit);
  app.post('/company/changePassword', JWTPolicy, controller.changePassword);
  app.get('/company/qrCode', JWTPolicy, controller.generateQRCode);
  //app.post('/company/changeStatus', JWTPolicy, controller.changeStatus);
  app.post('/company/uploadLogo', multerConfig.single('image'), controller.uploadLogo);
}
