module.exports = (app)=>{
  const controller = app.controllers.PagseguroController;

  app.get('/pagseguro/assinatura', controller.assinatura);
  app.post('/pagseguro/notificacao',  controller.notificacao);
}
