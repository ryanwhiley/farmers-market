var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');
var Good = mongoose.model('Good');
var User = mongoose.model('User');
var Purchase = mongoose.model('Purchase');
var nodemailer = require('nodemailer');
// var goods = require('./goods')



var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_NAME, // Your email id
    pass: process.env.EMAIL_PW // Your password
  }
});


var auth = jwt({secret: process.env.JWT_SECRECT, userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// get goods by type
router.get('/:type', function(req, res, next) {
  res.json(req.goods);
});

// get good by id
router.get('/goods/IDs', function(req, res) {
  Good.find()
    .where('quantityForSale').gt(0)
    .where('_id').in(req.query.good_ids)
    .exec(function (err, goods) {
      //make magic happen
      if(err){ return next(err); }
      res.json(goods);
    });
});

// create new pruchase in purchase table
router.post('/goods/purchase', auth, function(req, res, next) {
  var purchase = new Purchase(req.body);
  purchase.save(function(err, purchase){
    if(err){ console.log(err); return next(err); }
    res.json(purchase);
  });
});

// get good by id
router.get('/goods/:good', function(req, res) {
  res.json(req.good);
});

// create new good
router.post('/goods', auth, function(req, res, next) {
  var good = new Good(req.body);
  good.seller = req.payload.username;
  good.save(function(err, good){
    if(err){ console.log(err); return next(err); }
    res.json(good);
  });
});

// update user
// used for updating cart, etc
router.post('/users/update', function(req, res, next) {
  // console.log(User.schema.methods.generateJWT());
  User.findOneAndUpdate({'_id':req.body.user._id}, req.body.user, {new: true} ,function(err,user){
    if(err){ return console.log(err); next(err); }
    res.json({token: user.generateJWT()})
  })
});

// search users
router.get('/users/search/:term', function(req,res){
  User.find({ username: { "$regex": req.params.term, "$options": "i" } })
  .select('username email phone')
  .limit(10)
  .exec(function(err,users){
    res.json(users);
  })
})

// search goods
router.get('/goods/search/:term', function(req,res){
  Good.find({$or:[{ name: { "$regex": req.params.term, "$options": "i" } }, { type: { "$regex": req.params.term, "$options": "i" } }, { category: { "$regex": req.params.term, "$options": "i" } }]})
  .where('quantityForSale').gt(0)
  .select('name seller type category pricePerUnit')
  .limit(10)
  .exec(function(err,goods){
    res.json(goods);
  })
})

// get purchases by user
router.get('/purchases/:user', function(req,res,next){
  Purchase.find( { $or:[ {'seller':req.params.user}, {'buyer':req.params.user}]}, function(err,purchases){
    if(err){ return next(err); }
    res.json(purchases);
  });
})

// update user in table, get back web token for storage on front end
// router.post('/users/update', function(req,res,next){
//   console.log(req.body.user._id);
//   User.findOneAndUpdate({'_id':req.body.user._id}, req.body.user, {new: true} ,function(err,user){
//     if(err){ return console.log(err); next(err); }
//     res.json({token: user.generateJWT()})
//   })
// })

// goods param
router.param('good', function(req, res, next, id) {
  var query = Good.findById(id);
  query.exec(function (err, good){
    if (err) { return next(err); }
    if (!good) { return next(new Error('can\'t find good')); }

    req.good = good;
    return next();
  });
});

// type param
router.param('type', function(req, res, next, id) {
  var query = Good.find({type: req.params.type}).where('quantityForSale').gt(0);
  query.exec(function (err, goods){
    if (err) { return next(err); }
    if (!goods) { return next(new Error('can\'t find goods')); }

    req.goods = goods;
    return next();
  });
});


// update specific good
router.put('/goods/update', function(req, res, next) {
  Good.update({'_id':req.body.good._id}, req.body.good ,function(err,good){
    if(err){ return console.log(err); next(err); }
    res.json(good);
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

// delete good
router.delete('/goods', function(req, res, next) {
  Good.remove({'_id':req.params.good},function(err,goods){
    if(err){ return next(err); }
    res.json(goods);
  })
});

// get goods for sale by user
router.get('/users/:user/goods', function(req, res, next) {
  Good.find({'seller':req.params.user},function(err, goods){
    if(err){ return next(err); }
    res.json(goods);
  });
});

// simple user lookup, used from auth service
router.get('/users/:user', function(req, res, next) {
  findUser(req.params.user, res, next)
});

// create new user
router.post('/register', function(req, res, next){
  var phoneMatch = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  var emailMatch = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  console.log(1);
  if(!req.body.username || !req.body.password || !req.body.email || !req.body.phone){
    return res.status(400).json({message: 'Please fill out all fields'});
  }else if(!req.body.phone.match(phoneMatch)){
    return res.status(400).json({message: 'Please enter a valid phone number'});
  }else if(!emailMatch.test(req.body.email)){
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
    if(err){ return next(err); }
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

function findUser(user, res, next){
  User.findOne({'username':user},function(err,user){
    if(err){ return next(err); }
    return res.json(user);
  })
}

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
    from: '<ryanfarmersmarket@gmail.com>', // sender address
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