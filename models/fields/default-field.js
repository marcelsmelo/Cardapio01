module.exports = (type='String', defaultValue, validation = null) => {
  let field = {
    type: type,
    default: defaultValue
  }
  if(validation){
    field.validate = {
      validator: require(`../validations/${validation}.js`),
      message: '"{VALUE}" não é um {PATH} válido!'
    }
  }
  return field;
}
