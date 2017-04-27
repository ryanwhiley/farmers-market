var express = require('express'),
    router = express.Router(),
    jwt = require('express-jwt'),
    mongoose = require('mongoose'),
    Purchase = mongoose.model('Purchase'),
    email = require('../helpers/email');


var auth = jwt({secret: process.env.JWT_SECRECT, userProperty: 'payload'});

// create new pruchase in purchase table
router.post('/', auth, function(req, res, next) {
  Purchase.create(req.body, function(err,purchase){
    if(err){ return next(err); }
    res.json(purchase);
  })
});

// send purchase emails
router.put('/email', function(req,res,next){
  // send emails to sellers
  // send one email to buyer
  // use flag from controller through service
  if(req.body.toSeller){
    email.sendPurchaseEmail(req.body.seller, req.body.buyer, req.body.toSeller, req.body.goods)
  }else{
    email.sendPurchaseEmail(req.body.buyer, req.body.seller, req.body.toSeller, req.body.goods)
  }
  res.json({'good':'good'})
});


// get purchases by user
router.get('/:user', function(req,res,next){
  Purchase.findByUser(req.params.user, function(err,purchases){
    if(err){ return next(err); }
    res.json(purchases);
  })
})

module.exports = router;
