module.exports = (app)=>{
  const controller = app.controllers.PagseguroController;

  app.get('/pagseguro/assinatura', controller.assinatura);
  app.get('/pagseguro/cancelar', controller.cancelar);
  app.post('/pagseguro/notificacao',  controller.notificacao);
}
