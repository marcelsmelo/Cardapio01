module.exports = (app)=>{
  const controller = app.controllers.PagSeguroController;

  app.get('/pagseguro/assinatura', controller.assinatura);
  app.post('/pagseguro/notificacao',  controller.notificacao);
}
