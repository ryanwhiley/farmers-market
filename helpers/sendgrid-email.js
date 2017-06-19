var sg = require('sendgrid')(process.env.SENDGRID_API_KEY),
		sg_lu = require('./sg-template-id-lu.json'),
		sgemail = {};

// ======================
// exported functions
// ======================
sgemail.sendForgotPasswordEmail = function(email,token){
	var template_id = sg_lu['forgotpw'];
	var request = buildStandardRequest(email,template_id);
	request.body.personalizations[0].substitutions = forgotPWSub(token);
	request.body.personalizations[0].subject = "Farm to Meal Password Reset";
	sendEmail(request)
};

sgemail.sendLowStockEmail = function(recipient,goods){
	var template_id = sg_lu['lowstock'];
	var request = buildStandardRequest(recipient,template_id);
	request.body.personalizations[0].to[0].name = goods[0].seller || '';
	request.body.personalizations[0].substitutions = lowStockHTMLSub(buildLowStockHTML(goods),goods[0].seller || '');
	request.body.personalizations[0].subject = "Low Stock Notice";
	sendEmail(request);
}

sgemail.sendPurchaseEmail = function(recipient,other,toSeller,goods){
	console.log(toSeller,recipient, 'seller')
	var template_id = sg_lu['purchase-buyer'];
	var request = buildStandardRequest(recipient.email,template_id);
	request.body.personalizations[0].substitutions = purchaseHTMLSub(determinePurchaseEmailHTMLFunction(toSeller,other,goods));
	request.body.personalizations[0].subject = getProperPurchaseSubject(toSeller);
	sendEmail(request);
}


// ======================
// private functions 
// ======================
function buildStandardRequest(email,template_id){
	var request = sg.emptyRequest();
	request.body = {
	  "from": {
	    "email": "hello@farmtomeal.com",
	    "name": "Ryan at Farm to Meal"
	  },
	  "personalizations" : [
	    {
	      "to": [
	        {
	          "email": email
	        }
	      ],
	    }
	  ],
	  "template_id": template_id
	};
	request.method = 'POST';
	request.path = '/v3/mail/send';
	return request;
}

function buildLowStockHTML(goods){
	var htmlString = '';
	for(var i = 0;i<goods.length;i++){
		htmlString+='<div><strong class="capitalize">'+goods[i].name+'</strong>&nbsp;'+goods[i].quantityForSale+' units remaining</div>  <div><a href="http://www.farmtomeal.com/goods/'+goods[i]._id+'/update">Update</a></div><hr />';
	}
	return htmlString;
}

function getProperPurchaseSubject(toSeller){
	if(toSeller){
		return 'Goods Sold!';
	}else{
		return 'Goods Bought!'
	}
}

function determinePurchaseEmailHTMLFunction(toSeller,other,goods){
  if(toSeller){
    return buildEmailHTMLSeller(toSeller,other,goods);
  }else{
    return buildEmailHTMLBuyer(goods);
  }
}

// purchase - seller html functions
function buildEmailHTMLSeller(toSeller, user, goods){
  return buildGoodsStringSeller(goods)+
          "<b>Buyer Info</b><p>"+user.username+"</p><p>"+user.address.street+"<br>"+user.addres.city+"</p><p>"+user.email+"</p><p>"+user.phone+"</p>";
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

// purchase - buyer html functions
function buildEmailHTMLBuyer(cart){
  return buildGoodsStringBuyer(cart);
}

function buildGoodsStringBuyer(cart){
  var goodsString = '';
  var total = 0;
  for(var i = 0,lenI=cart.length;i<lenI;i++){
    goodsString += "<hr><b>Seller Info</b><p>"+cart[i].seller.name+"</p><p>"+cart[i].seller.address.street+"<br>"+cart[i].seller.address.city+"</p><p>"+cart[i].seller.email+"</p><p>"+cart[i].seller.phone+"</p>";
    for(var j = 0,lenJ=cart[i].goods.length;j<lenJ;j++){
      total += parseFloat(cart[i].goods[j].price);
      goodsString += "<p>Good: "+cart[i].goods[j].name+"<br>Quantity: "+cart[i].goods[j].quantity+"<br>Amount: $"+cart[i].goods[j].price+"</p>";
    }
  }
  goodsString += "<b>Total: $"+total+"</b><br>";
  return goodsString;
}


// ======================
// substitution functions
// ======================
function forgotPWSub(token){
	return {"-token-":token};
}

function lowStockHTMLSub(html,name){
	return {'-goods-':html,'-name-':name};
}

function purchaseHTMLSub(goods){
	return {'-goods-':goods};
}

// ======================
// send email through sg
// ======================
function sendEmail(request){
	sg.API(request, function (error, response) {
	  if (error) {
	    console.log('Error response received',error);
	  }
	  console.log(response.statusCode);
	  console.log(response.body);
	  console.log(response.headers);
	});
}

module.exports = sgemail;