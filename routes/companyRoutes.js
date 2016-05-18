module.exports = (app)=>{
  const controller = app.controllers.CompanyController;
  const JWTPolicy = require('../lib/jwtVerify.js');

  app.post('/company/edit', JWTPolicy, controller.edit);
  app.post('/company/changePassword', JWTPolicy, controller.changePassword);
  app.get('/company/qrCode', JWTPolicy, controller.generateQRCode);
  //app.post('/company/changeStatus', JWTPolicy, controller.changeStatus);
}
