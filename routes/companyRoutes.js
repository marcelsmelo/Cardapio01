module.exports = (app)=>{
  const controller = app.controllers.CompanyController;
  const JWTPolicy = require('../lib/jwtVerify.js');

  app.post('/company/editCompany', JWTPolicy, controller.editCompany);
  app.post('/company/changePassword', JWTPolicy, controller.changePassword);
}
