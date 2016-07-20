module.exports = (app)=>{
  const controller = app.controllers.TagsController;
  const JWTPolicy = require('../lib/jwtVerify.js');

  app.get('/tags/generate', JWTPolicy, controller.generateTags);
  app.get('/tags/get', JWTPolicy, controller.getTags);

}
