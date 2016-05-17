const _validate = require('../validations/isName.js');

// const _validate = (v)=>{
//   return v.length > 3;
// };

module.exports = {
  type: String,
  required: 'O campo NAME é obrigatório!',
  unique: true,
  validator:[_validate;, 'Insira um nome válido!']
}
