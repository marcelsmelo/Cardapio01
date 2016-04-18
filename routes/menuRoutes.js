module.exports = (app)=>{
  const controller = app.controllers.MenuController;
  const JWTPolicy = require('../lib/jwtVerify.js');

  app.get('/menu/find/', controller.find);
  app.get('/menu/new', JWTPolicy, controller.new);
  app.get('/menu/qrCode', JWTPolicy, controller.generateQRCode);
}
