module.exports = {
  // Caso o método da rota seja diferente de GET, utilizar o nome do método antes da rota
  //(Ex: 'POST /nome/nome2')
  '/': {
    controller: 'IndexController',
    action: 'index'
  },
  'POST /signup' : {
    controller: 'IndexController',
    action: 'signup'
  },
  'POST /authenticate' :{
    controller: 'IndexController',
    action: 'authenticate'
  },
  '/memberinfo':{
    controller: 'IndexController',
    action: 'memberinfo',
    policy: 'jwt'
  }
};
