module.exports = (app)=>{
  const controller = app.controllers.CompanyController;
  const JWTPolicy = require('../lib/jwtVerify.js');

  app.get('/company/get', JWTPolicy, controller.get);
  app.post('/company/edit', JWTPolicy, controller.edit);
  app.post('/company/changePassword', JWTPolicy, controller.changePassword);
  //app.post('/company/changeStatus', JWTPolicy, controller.changeStatus);
  app.post('/company/uploadLogo', JWTPolicy, controller.uploadLogo);
  app.post('/company/uploadBanner', JWTPolicy, controller.uploadBanner);
  app.post('/company/fieldVerify', controller.uniqueFieldVerify);
}
