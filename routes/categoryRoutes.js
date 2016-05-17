module.exports = (app)=>{
  const controller = app.controllers.CategoryController;
  const JWTPolicy = require('../lib/jwtVerify.js');
  const enableCors = require('../lib/enableCORS.js');

  app.get('/category/findByCompany', enableCors, controller.findByCompany);
  app.post('/category/new', JWTPolicy, controller.new);
  app.post('/category/edit', JWTPolicy, controller.edit);
  app.get('/category/qrCode', JWTPolicy, controller.generateQRCode);
}
