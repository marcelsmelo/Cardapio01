const User = require('../models/UserModel.js');
const config = require('../config/config.js');
var jwt  = require('jsonwebtoken');

module.exports = {
  signup:(req, res, next)=>{
    if(!req.body.name || !req.body.password){
      res.json({success: false, msg: 'Please username and pass required!'});
    } else{
      const newUser = new User(req.body);
      newUser.save().then(
        (data)=>{
        res.json({success: true, msg: 'Successful created new user.', user: data});
        },
        (err)=>{
          res.json({success: false, msg: 'UserName already exists.', err: err});
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
                var token = jwt.sign(user, config.secret, {
                  expiresIn: 14400 // 24h
                });
                res.json({success: true, msg: 'Enjou your token', token: 'JWT '+token});
              }else {
                res.json({success: false, msg: 'Authentication failed. Wrong Password!'})
              }
            });
          }
        },
        (err)=>{
          res.status(404).json({success: true, msg: 'Authentication failed. User or password invalid!'});
        }
    );
  },

  loggedInfo: (req, res, next)=>{
    var user = req.userDecoded;
    if(!user){
      res.status(404).json({success: false, msg: 'Just Logged User!'});
    }
    res.status(200).json({success: true, msg: 'Welcome in the member area, '+user.name+' !', user: user});
  },


  editUser: (req, res, next) =>{
    const user = req.userDecoded;
    if(!user){
      res.status(404).json({success: false, msg: 'Just Logged User!'});
    }
    User.findOneAndUpdate({_id: user._id}, req.body,{new:true}).then(
      (userMod)=>{
        console.log(userMod);
        res.status(200).json({success: true, user: userMod});
      },
      (err)=>{
        res.status(404).json({success: false, msg: err});
      }
    );
  },

  signout: (req, res, next) => {
    res.status(200).json({success: true, msg: 'Logout OK !'});
  },

  all:(req, res, next) => {
    User.find().then(
      (data) =>{
        res.json(data);
      },
      (err)=>{
        res.json(err);
      }
    );
  },

};
