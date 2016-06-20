module.exports = (type='String', validation = null) => {
  let field = {
    type: type,
    required: 'O campo {PATH} é obrigatório!',
    unique: true,
  }
  if(validation){
    field.validate = {
      validator: require(`../validations/${validation}.js`),
      message: '"{VALUE}" não é um {PATH} válido!'
    }
  }
  return field;
}
