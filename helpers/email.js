var nodemailer = require('nodemailer')
		, email = {};

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_NAME, // Your email id
    pass: process.env.EMAIL_PW // Your password
  }
});

email.sendForgotPasswordEmail = function(email,token,host){
	var mailOptions = {
      to: email,
      from: 'passwordreset@demo.com',
      subject: 'Farmers Market Password Reset',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account on Farmers Market.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + host + '/#/users/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    transporter.sendMail(mailOptions, function(err) {
      if (err) throw err;
      return email;
    });
}

email.sendPurchaseEmail = function(recipient,other,toSeller,goods){
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

// functions that dont need to be exposed
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

module.exports = email;

