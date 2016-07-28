module.exports = (app)=>{
  const controller = app.controllers.PagseguroController;
  const JWTPolicy = require('../lib/jwtVerify.js');

  app.get('/pagseguro/assinatura',JWTPolicy, controller.assinatura);
  app.get('/pagseguro/cancelar', JWTPolicy, controller.cancelar);
  app.post('/pagseguro/notificacao',  controller.notificacao);
}
