const bcrypt = require('bcrypt');

module.exports = (schema, options)=>{

  schema.pre('save', function (next) {
      const company = this;
      if (this.isModified('password') || this.isNew) {
          bcrypt.genSalt(10, function (err, salt) {
              if (err) {
                  return next(err);
              }
              bcrypt.hash(company.password, salt, function (err, hash) {
                  if (err) {
                      return next(err);
                  }
                  company.password = hash;
                  next();
              });
          });
      } else {
          return next();
      }
  });

  schema.pre('findOneAndUpdate', function (next){
      const company = this._update;
      if (company.password !== undefined) {
          bcrypt.genSalt(10, function (err, salt) {
              if (err) {
                  return next(err);
              }
              bcrypt.hash(company.password, salt, function (err, hash) {
                  if (err) {
                      return next(err);
                  }
                  company.password = hash;
                  next();
              });
          });
      }
  });
};
