module.exports = (app)=>{
  const controller = app.controllers.PagseguroController;
  const JWTPolicy = require('../lib/jwtVerify.js');

  app.get('/pagseguro/subscription',JWTPolicy, controller.subscription);
  app.get('/pagseguro/cancel', JWTPolicy, controller.cancel);
  app.post('/pagseguro/notification',  controller.notification);
  app.get('/pagseguro/getAll', JWTPolicy, controller.getAll);
}
