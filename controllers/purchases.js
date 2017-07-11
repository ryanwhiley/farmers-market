var express = require('express'),
    router = express.Router(),
    jwt = require('express-jwt'),
    mongoose = require('mongoose'),
    Purchase = mongoose.model('Purchase'),
    sendgrid = require('../helpers/sendgrid-email'),
    general = require('../helpers/general');


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
    sendgrid.sendPurchaseEmail(req.body.seller, req.body.buyer, req.body.toSeller, req.body.goods)
  }else{
    sendgrid.sendPurchaseEmail(req.body.buyer, req.body.seller, req.body.toSeller, req.body.goods)
    // email.sendPurchaseEmail(req.body.buyer, req.body.seller, req.body.toSeller, req.body.goods)
  }
  res.json({'good':'good'})
});

router.put('/lowStock', function(req,res,next){
  sendgrid.sendLowStockEmail(req.body.seller, req.body.goods);
  // email.lowStockNotice(req.body.goods, req.body.seller);
  res.json({'success':'success'});
})

router.put('/update', function(req, res, next) {
  Purchase.update({'_id':req.body.purchase._id}, req.body.purchase ,function(err,purchase){
    if(err){ return console.log(err); next(err); }
    res.json(purchase);
  })
});

router.get('/mostPopular/:count', function(req,res,next){
  Purchase.mostPopular(req.params.count, function(err,purchases){
    if(err){ return next(err); }
    res.json(general.consolidateMostPopularGoods(purchases));
  })
})


// get purchases by user
router.get('/:user_id', function(req,res,next){
  Purchase.findByUser(req.params.user_id, function(err,purchases){
    if(err){ return next(err); }
    res.json(purchases);
  })
})

module.exports = router;
