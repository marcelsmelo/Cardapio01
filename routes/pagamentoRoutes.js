module.exports = (app)=>{
  const controller = app.controllers.PagamentoController;

  app.get('/pagamento/assinatura', controller.assinatura);
  app.post('/pagamento/notificacao', controller.notificacao);
}
