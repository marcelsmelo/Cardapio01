module.exports = (app)=>{
  const controller = app.controllers.CategoryController;
  const JWTPolicy = require('../lib/jwtVerify.js');
  const enableCors = require('../lib/enableCORS.js');

  app.get('/category/findByCompany', enableCors, controller.findCategoriesByCompany);
  app.post('/category/new', JWTPolicy, controller.newCategory);
  app.post('/category/edit', JWTPolicy, controller.editCategory);
  app.get('/category/qrCode', JWTPolicy, controller.generateQRCode);
}
