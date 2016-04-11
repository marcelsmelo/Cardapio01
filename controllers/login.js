const User = require('../models/user.js');
const config = require('../config/config.js');
var jwt  = require('jsonwebtoken');

module.exports = {
    index:(req, res, next)=>{
      res.json({success: true, msg: 'tessssste'});
    },
    signup:(req, res, next)=>{
      if(!req.body.name || !req.body.password){
        res.json({success: false, msg: 'Please username and pass required!'});
      } else{
        var newUser = new User({
          name: req.body.name,
          password: req.body.password
        });

        newUser.save((err)=>{
          if(err){
            return res.json({success: false, msg: 'UserName already exists.'});
          }
          res.json({success: true, msg: 'Successful created new user.'})
        });
      }
    },
    authenticate: (req, res, next)=> {
      User.findOne({
        name: req.body.name
      }, (err, user)=>{
        if(err) throw err;
        if(!user){
          res.json({success: false, msg: 'Authentication failed. User not found!'});
        }else{
          user.comparePassword(req.body.password, (err, isMatch)=>{
            if(isMatch && !err){
              var token = jwt.sign(user, config.secret, {
                expiresInMinutes: 1440 // 24h
              });
              res.json({success: true, msg: 'Enjou your token', token: 'JWT '+token});
            }else {
              res.json({success: false, msg: 'Authentication failed. Wrong Password!'})
            }
          });
        }
      });
    },
    memberinfo: (req, res, next)=>{
      var user = req.decoded._doc;
      console.log(user.name);
      res.status(200).json({success: true, msg: 'Welcome in the member area, '+user.name+' !'});
    }
};
