'use strict';

const User = require('../models/UserModel.js');

module.exports = {
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

  editUser: (req, res, next) =>{
    const user = req.userDecoded;

    if(!user){
      res.status(404).json({success: false, msg: 'Just Logged User!'});
    }

    User.findOneAndUpdate({_id: user._id}, req.body).then(
      (userMod)=>{
        let token = require('../lib/generateJWT.js')(userMod);
        res.status(200).json({success: true, msg:'User updated!', user: userMod, token: token});
      },
      (err)=>{
        res.status(404).json({success: false, msg: 'Updated failed!', err: err});
      }
    );
  },

  changePassword: (req, res, next) =>{
    const user = req.userDecoded;

    if(!user){
      res.status(404).json({success: false, msg: 'Just Logged User!'});
    }
    if(!req.body.password){
      res.status(404).json({success: false, msg: 'Password required!'});
    }

    User.findOneAndUpdate({_id: user._id}, {password: req.body.password}).then(
      (data)=>{
        let token = require('../lib/generateJWT.js')(data);
        res.status(200).json({success: true, msg:'User updated!', user: data, token: token});
      },
      (err)=>{
        res.status(404).json({success: false, msg: 'Updated failed!', err: err});
      }
    );
  },

}
