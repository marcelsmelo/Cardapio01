module.exports = (app)=>{
  const controller = app.controllers.MenuController;
  const JWTPolicy = require('../lib/jwtVerify.js');
  const enableCors = require('../lib/enableCORS.js');

  app.get('/menu/findCategoriesByCompany', enableCors, controller.findCategoriesByCompany);
  app.get('/menu/findItemsByCategory', enableCors, controller.findItemsByCategory);
  app.post('/menu/newCategory', JWTPolicy, controller.newCategory);
  app.post('/menu/newItem', JWTPolicy, controller.newItem);
  app.post('/menu/editCategory', JWTPolicy, controller.editCategory);
  app.post('/menu/editItem', JWTPolicy, controller.editItem);d
  app.get('/menu/qrCode', JWTPolicy, controller.generateQRCode);
}
