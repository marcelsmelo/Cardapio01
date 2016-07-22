const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const logoURL = 'https://s3.amazonaws.com/cardapio01-images/default_logo.png';
const bannerURL = 'https://s3.amazonaws.com/cardapio01-images/default_banner.png';

let CompanySchema = new Schema({
  name: require('./fields/required-unique-field.js')('String','isName'),
  cnpj: require('./fields/required-unique-field.js')('String', 'isCnpjOrCpf'),
  email: require('./fields/required-unique-index-field.js')('String', 'isEmail'),
  password: require('./fields/required-field.js')('String', 'isPassword'),
  phone:{
    ddd: require('./fields/field.js')('Number', 'isDDD'),
    number : require('./fields/field.js')('String', 'isPhone')
  },
  address:{
    zipCode: require('./fields/field.js')('String', 'isZipCode'),
    street: require('./fields/field.js')('String'),
    number: require('./fields/field.js')('Number'),
    neighborhood: require('./fields/field.js')('String'),
    city: require('./fields/field.js')('String'),
    state : require('./fields/field.js')('String')
  },
  images:{
      logo: require('./fields/required-default-field.js')('String', logoURL),
      banner: require('./fields/required-default-field.js')('String', bannerURL),
  },
  tags:{
      type: require('./fields/required-default-field.js')('String', 'URL padrão'),
  },
  social:{
    facebook:require('./fields/field.js')('String'),
    instagram:require('./fields/field.js')('String')
  },
  accessToken: require('./fields/field.js')('String'),
  status: require('./fields/required-default-field.js')('Boolean', true)
});

CompanySchema.plugin(require('./plugins/timestamp.js'));
CompanySchema.plugin(require('./plugins/passwordCriptografy'));

CompanySchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};


module.exports = mongoose.model('Company', CompanySchema);
