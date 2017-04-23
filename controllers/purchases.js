var express = require('express'),
    router = express.Router(),
    jwt = require('express-jwt'),
    mongoose = require('mongoose'),
    Purchase = mongoose.model('Purchase'),
    nodemailer = require('nodemailer');


var auth = jwt({secret: process.env.JWT_SECRECT, userProperty: 'payload'});
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_NAME, // Your email id
    pass: process.env.EMAIL_PW // Your password
  }
});

// create new pruchase in purchase table
router.post('/goods/purchase', auth, function(req, res, next) {
  Purchase.create(req.body, function(err,purchase){
    if(err){ return next(err); }
    res.json(purchase);
  })
});

// send purchase emails
router.put('/email/purchase', function(req,res,next){
  // send emails to sellers
  // send one email to buyer
  // use flag from controller through service
  if(req.body.toSeller){
    sendPurchaseEmail(req.body.seller, req.body.buyer, req.body.toSeller, req.body.goods)
  }else{
    sendPurchaseEmail(req.body.buyer, req.body.seller, req.body.toSeller, req.body.goods)
  }
  res.json({'good':'good'})
});


// get purchases by user
router.get('/purchases/:user', function(req,res,next){
  Purchase.findByUser(req.params.user, function(err,purchases){
    if(err){ return next(err); }
    res.json(purchases);
  })
})

module.exports = router;


function sendPurchaseEmail(recipient,other,toSeller,goods){
  // buyer-> buyer email, seller info (name, phone, address), good info
  // seller-> buyer email, seller info (name, phone, address), good info
  var mailOptions = buildMailOptions(recipient,other,toSeller,goods);
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}

function buildMailOptions(recipient,other,toSeller,goods){
  var mailOptions = {
    from: '<'+process.env.EMAIL_NAME+'>', // sender address
    to: recipient.email, // list of receivers
    subject: buildEmailSubject(toSeller, goods), // Subject line
    // text: 'text' //, // plaintext body
    html: determineEmailHTMLFunction(toSeller,other,goods) // You can choose to send an HTML body instead
  };
  return mailOptions;
}

function determineEmailHTMLFunction(toSeller,other,goods){
  if(toSeller){
    return buildEmailHTMLSeller(toSeller,other,goods);
  }else{
    return buildEmailHTMLBuyer(goods);
  }
}

function buildEmailSubject(toSeller, goods){
  if(toSeller){
    return 'Hello, You just made a sale!';
  }else{
    return 'Hello, You just bought cool shit!';
  }
}

function buildEmailHTMLSeller(toSeller, user, goods){
  return "<b>Hey</b><br>"+
          "<p>We're emailing you to notify that your following good(s) have been pruchased!</p>"+buildGoodsStringSeller(goods)+
          "<b>Buyer Info</b><p>"+user.username+"</p><p>"+user.address+"</p><p>"+user.email+"</p><p>"+user.phone+"</p>";
}

function buildEmailHTMLBuyer(cart){
  return "<b>Hey</b><br>"+
            "<p>We're emailing you to notify that you purchased the following good(s)!</p>"+buildGoodsStringBuyer(cart);
}

function buildGoodsStringSeller(goods){
  var goodsString = '';
  var total = 0;
  for(var i = 0,len=goods.length;i<len;i++){
    total += parseFloat(goods[i].price);
    goodsString += "<p>Good: "+goods[i].name+"<br>Quantity: "+goods[i].quantity+"<br>Amount: $"+goods[i].price+"<br></p>";
  }
  goodsString += "<b>Total: $"+total+"</b><br>";
  return goodsString;
}

function buildGoodsStringBuyer(cart){
  var goodsString = '';
  var total = 0;
  for(var i = 0,lenI=cart.length;i<lenI;i++){
    goodsString += "<b>Seller Info</b><p>"+cart[i].seller.name+"</p><p>"+cart[i].seller.address+"</p><p>"+cart[i].seller.email+"</p><p>"+cart[i].seller.phone+"</p>";
    for(var j = 0,lenJ=cart[i].goods.length;j<lenJ;j++){
      total += parseFloat(cart[i].goods[j].price);
      goodsString += "<p>Good: "+cart[i].goods[j].name+"<br>Quantity: "+cart[i].goods[j].quantity+"<br>Amount: $"+cart[i].goods[j].price+"</p>";
    }
  }
  goodsString += "<b>Total: $"+total+"</b><br>";
  return goodsString;
}