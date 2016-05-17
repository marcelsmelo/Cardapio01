module.exports = (app)=>{
  const controller = app.controllers.ItemController;
  const JWTPolicy = require('../lib/jwtVerify.js');
  const enableCors = require('../lib/enableCORS.js');

  app.get('/item/findByCategory', enableCors, controller.findByCategory);
  app.post('/item/new', JWTPolicy, controller.new);
  app.post('/item/edit', JWTPolicy, controller.edit);
}
