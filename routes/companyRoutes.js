module.exports = (app)=>{
  const controller = app.controllers.CompanyController;
  const JWTPolicy = require('../lib/jwtVerify.js');
  const multerConfig = require('../lib/multerConfig.js');

  app.get('/company/get', JWTPolicy, controller.get);
  app.post('/company/edit', JWTPolicy, controller.edit);
  app.post('/company/changePassword', JWTPolicy, controller.changePassword);
  app.get('/company/generateTags', JWTPolicy, controller.generateTags);
  //app.post('/company/changeStatus', JWTPolicy, controller.changeStatus);
  app.post('/company/uploadLogo', multerConfig.single('image'), JWTPolicy, controller.uploadLogo);
  app.post('/company/uploadBanner', multerConfig.single('image'), JWTPolicy, controller.uploadBanner);
}
