module.exports = (app)=>{
  const controller = app.controllers.ContactController;

  app.post('/contact', controller.form);
}
