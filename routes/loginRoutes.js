const JWTPolicy = require('../lib/jwtVerify.js');

module.exports = (app)=>{
  const controller = app.controllers.LoginController;
  
  app.post('/signup', controller.signup);
  app.post('/login', controller.login);
  app.get('/logout', JWTPolicy, controller.logout);
  app.get('/tokenVerify', JWTPolicy, controller.tokenVerify);
  app.post('/tokenVerify', JWTPolicy, controller.tokenVerify);
}
