'use strict';

const User = require('../models/UserModel.js');

module.exports = {

  signup:(req, res, next)=>{
    if(!req.body.name || !req.body.password){
      res.json({success: false, msg: 'Please username and pass required!'});
    }else{
      const newUser = new User(req.body);
      newUser.save().then(
        (data)=>{
        res.json({success: true, msg: 'Successful created new user.', user: data});
        },
        (err)=>{
          res.json({success: false, msg: 'Username already exists.', err: err});
        }
      );
    }
  },

  login: (req, res, next)=> {
    User.findOne({name: req.body.name}).then(
      (user)=>{
          if(!user){
            res.json({success: false, msg: 'Authentication failed. User not found!'});
          }else{
            user.comparePassword(req.body.password, (err, isMatch)=>{
              if(isMatch && !err){
                let token = require('../lib/generateJWT.js')(user);
                res.json({success: true, msg: 'Enjoy your token', token: token});
              }else {
                res.json({success: false, msg: 'Authentication failed. Wrong Password!'})
              }
            });
          }
        },
        (err)=>{
          res.status(404).json({success: false, msg: 'Authentication failed. User or password invalid!'});
        }
    );
  },

  loggedUserInfo: (req, res, next)=>{
    const user = req.userDecoded;

    res.status(200).json({success: true, msg: 'Welcome in the member area, '+user.name+' !', user: user});
  },

  logout: (req, res, next) => {
    const user = req.userDecoded;

    User.findOneAndUpdate({_id: user._id}, {accessToken: null}).then(
      (data) =>{
        res.status(200).json({success: true, msg: 'Logout OK !'});
      },
      (err) =>{
        res.status(404).json({success: false, msg: 'Logout NOK !'});
      }
    );

  },

};
