module.exports = (app)=>{
  const controller = app.controllers.ItemController;
  const JWTPolicy = require('../lib/jwtVerify.js');

  app.get('/item/findByCategory', controller.findByCategory);
  app.get('/item/findAllByCategory', JWTPolicy, controller.findAllByCategory);
  app.post('/item/new', JWTPolicy, controller.new);
  app.post('/item/edit', JWTPolicy, controller.edit);
  app.post('/item/changePosition', JWTPolicy,controller.changePosition);
  app.post('/item/changeStatus',JWTPolicy, controller.changeStatus);
  app.post('/item/remove',JWTPolicy, controller.remove);
}
