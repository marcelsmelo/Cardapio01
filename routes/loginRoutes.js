module.exports = (app)=>{
  const controller = app.controllers.LoginController;
  const JWTPolicy = require('../lib/jwtVerify.js');
  app.post('/signup', controller.signup);
  app.post('/login', controller.login);
  app.put('/editUser', JWTPolicy, controller.editUser);
  app.get('/userloggedInfo', JWTPolicy, controller.loggedInfo);
  app.get('/signout', JWTPolicy, controller.signout);
  app.get('/all', controller.all);
}
