var express = require('express'),
		router = express.Router(),
		mongoose = require('mongoose'),
		User = mongoose.model('User'),
		Good = mongoose.model('Good'),
		jwt = require('express-jwt'),
		passport = require('passport'),
		crypto = require('crypto'),
		async = require('async'),
    email = require('../helpers/email');

var auth = jwt({secret: process.env.JWT_SECRECT, userProperty: 'payload'});

// update user
// used for updating cart, etc
router.post('/update', function(req, res, next) {
  // console.log(User.schema.methods.generateJWT());
  User.findOneAndUpdate({'_id':req.body.user._id}, req.body.user, {new: true} ,function(err,user){
    if(err){ return next(err); }
    res.json({token: user.generateJWT()})
  })
});

// search users
router.get('/search/:term', function(req,res){
  User.search(req.params.term, function(err,users){
    if(err){ return next(err); }
    res.json(users);
  })
})

// get goods for sale by user
router.get('/:user/goods', function(req, res, next) {
  Good.find({'seller':req.params.user},null,{sort: {type:1}},function(err, goods){
    if(err){ console.log(err); return next(err); }
    res.json(goods);
  });
});

// simple user lookup, used from auth service
router.get('/:user', function(req, res, next) {
  User.findOne({'username':req.params.user},function(err,user){
    if(err){ return next(err); }
    return res.json(user);
  })
});

router.put('/email/farmer', function(req,res,next){
  return res.json({email: email.sendNewFarmerEmail(req.body.user)})
})

router.put('/email/user', function(req,res,next){
  return res.json({email: email.sendNewUserEmail(req.body.user)})
})

// reset password
router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          return res.status(500).json({ error: "No account with that email address exists." });
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      return res.json({email: email.sendForgotPasswordEmail(user.email,token,req.headers.host)});
      // var mailOptions = {
      //   to: user.email,
      //   from: 'passwordreset@demo.com',
      //   subject: 'Farmers Market Password Reset',
      //   text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account on Farmers Market.\n\n' +
      //     'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
      //     'http://' + req.headers.host + '/#/users/reset/' + token + '\n\n' +
      //     'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      // };
      // transporter.sendMail(mailOptions, function(err) {
      //   if (err) throw err;
      //   return res.json({email: user.email});
      // });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req,res){
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return res.send({message: 'Password reset token is invalid or has expired.'});
    }
    return res.json({});
  });
})

router.post('/reset/:token', function(req, res, next) {
  async.waterfall([
    function(done){
      if(req.body.password!==req.body.confirm){
        return res.status(400).json({error:'Password and confirmation password do not match.'})
      }else{
        done();
      }
    },

    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          res.status(400).send('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        user.password = user.setPassword(req.body.password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          if(err) throw err;
          // done();
          return res.json({token: user.generateJWT()});
        });
      });
    },
    // function(user, done) {
    //   var mailOptions = {
    //     to: user.email,
    //     from: 'passwordreset@demo.com',
    //     subject: 'Your password has been changed',
    //     text: 'Hello,\n\n' +
    //       'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
    //   };
    //   transporter.sendMail(mailOptions, function(err) {
    //     return res.json();
    //   });
    // }
  ], function(err) {
    res.redirect('/');
  });
});




// create new user
router.post('/register', function(req, res, next){
  var phoneMatch = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  var emailMatch = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(!req.body.username || !req.body.password || !req.body.email || !req.body.phone){
    return res.status(400).json({message: 'Please fill out all fields'});
  }else if(!req.body.phone.match(phoneMatch)){
    return res.status(400).json({message: 'Please enter a valid phone number'});
  }else if(!emailMatch.test(req.body.email)){
    console.log(req.body.email);
    return res.status(400).json({message: 'Please enter a valid email'});
  }
  var user = new User();

  user.username = req.body.username;
  user.email = req.body.email;
  user.phone = user.formatPhoneNumber(req.body.phone);
  user.address = req.body.address;
  user.farmer = req.body.farmer;
  user.created_at = new Date();
  user.setPassword(req.body.password)

  user.save(function (err, user){
    if(err){ 
      if(err.code==11000){
        return res.status(400).json({message: 'The email or username have already been registered.  If you have forgotten your password please click the "Forgot Password" link below.'});
      }else{
        return res.status(400).json({message: 'There was an error registering your account, please try again later or contact us.'});
      }
    }
    return res.json({token: user.generateJWT()})
  });
});

// login obviously
router.post('/login', function(req, res, next){
  if(!req.body.login || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});




module.exports = router;


// example export so i dont forgot
// var obj = {}
// obj.add = function(){}
// module.exports = obj