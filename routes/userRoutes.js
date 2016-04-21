module.exports = (app)=>{
  const controller = app.controllers.UserController;
  const JWTPolicy = require('../lib/jwtVerify.js');

  app.put('/user/', JWTPolicy, controller.editUser);
  app.get('/user/', JWTPolicy, controller.all);
  app.post('/user/changePassword', JWTPolicy, controller.changePassword);
}
