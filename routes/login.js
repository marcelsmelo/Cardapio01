module.exports = (app)=>{
  var controller = app.controllers.login;
  app.get('/', controller.index);
  app.post('/signup', controller.signup);
  app.post('/authenticate', controller.authenticate);
  app.get('/memberinfo', controller.memberinfo);
}
