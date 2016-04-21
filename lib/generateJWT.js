'use strict';

const config = require('../config/config.js');
const jwt  = require('jsonwebtoken');
const User = require('../models/UserModel.js');



module.exports = (user)=>{
  let token = jwt.sign(user, config.secret, {
    expiresIn: 14400 // 24h
  });

  User.findOneAndUpdate({_id: user._id}, {accessToken: token}).then(
    (data)=>{
      token = data.accessToken;
    },
    (err)=>{
      token =  null;
    }
  );

  return token;
}
