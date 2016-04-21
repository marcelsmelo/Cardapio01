
const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const User = require('../models/UserModel.js');

module.exports = (req, res, next)=>{

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    User.findOne({accessToken: token}).then(
      (user)=>{
        if(!user){
            return res.status(404).json({success: false, msg: 'Token invalid!'});
        }
        jwt.verify(token, config.secret, function(err, decoded) {
          if (err) {
            return res.status(404).json({ success: false, message: 'Failed to authenticate token.' });
          } else {
            // if everything is good, save to request for use in other routes
            req.userDecoded = decoded._doc;
            next();
          }
        });
      },
      (err)=>{
        return res.status(404).json({success: false, msg: 'Token invalid!'});
      }
    )
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });
  }
};
