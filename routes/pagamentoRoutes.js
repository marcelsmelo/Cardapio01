module.exports = (app)=>{
  const controller = app.controllers.PagamentoController;
  const enableCors = require('../lib/enableCORS.js');
  app.get('/pagamento/assinatura', controller.assinatura);
  app.post('/pagamento/notificacao',enableCors,  controller.notificacao);
}
