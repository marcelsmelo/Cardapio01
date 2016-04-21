module.exports = (app)=>{
  const controller = app.controllers.MenuController;
  const JWTPolicy = require('../lib/jwtVerify.js');

  app.get('/menu/:userID', controller.findByUser);
  app.post('/menu/', JWTPolicy, controller.new);
  app.get('/menu/qrCode', JWTPolicy, controller.generateQRCode);
}
