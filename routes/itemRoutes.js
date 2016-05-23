module.exports = (app)=>{
  const controller = app.controllers.ItemController;
  const JWTPolicy = require('../lib/jwtVerify.js');
  const enableCors = require('../lib/enableCORS.js');

  app.get('/item/findByCategory', enableCors, controller.findByCategory);
  app.get('/item/findAllByCategory', JWTPolicy, controller.findAllByCategory);
  app.post('/item/new', JWTPolicy, controller.new);
  app.post('/item/edit', JWTPolicy, controller.edit);
  app.post('/item/changeStatus',JWTPolicy, controller.changeStatus);
  app.post('/item/remove',JWTPolicy, controller.remove);
}
