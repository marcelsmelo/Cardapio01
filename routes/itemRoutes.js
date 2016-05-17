module.exports = (app)=>{
  const controller = app.controllers.ItemController;
  const JWTPolicy = require('../lib/jwtVerify.js');
  const enableCors = require('../lib/enableCORS.js');

  app.get('/item/findByCategory', enableCors, controller.findItemsByCategory);
  app.post('/item/new', JWTPolicy, controller.newItem);
  app.post('/item/edit', JWTPolicy, controller.editItem);
}
