module.exports = (app)=>{
  const controller = app.controllers.LoginController;
  const JWTPolicy = require('../lib/jwtVerify.js');

  app.post('/signup', controller.signup);
  app.post('/login', controller.login);
  app.get('/logout', JWTPolicy, controller.logout);
  app.get('/tokenVerify', JWTPolicy, controller.tokenVerify);
}
