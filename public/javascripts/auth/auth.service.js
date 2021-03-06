angular.module('farmersMarket.auth.service', [])

.factory('auth',auth)

function auth($http, $window){
	var auth = {};
  // functions that dont hit api
  auth.saveToken = function (token){
    $window.localStorage['farmers-market-token'] = token;
  };

  auth.updateToken = function(token){
    $window.localStorage['farmers-market-token'] = token;
  };
  auth.getToken = function (){
    return $window.localStorage['farmers-market-token'];
  };
  auth.isLoggedIn = function(){
    var token = auth.getToken();

    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };
  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload;
    }
  };
  auth.buildPurchaseObject = function(good,buyer_id,userQuantity){
    var purchase = {};
    purchase.good = good.name;
    purchase.good_id = good._id;
    purchase.buyer = buyer_id;
    purchase.quantity = parseInt(userQuantity);
    purchase.price = parseFloat(good.pricePerUnit);
    purchase.delivery_fee = good.delivery=='delivery' ? good.delivery_fee : 0;
    return this.userLookUp(good.seller._id).then(function(res){
      purchase.seller = {};
      purchase.seller._id = res.data._id;
      purchase.seller.name = res.data.username;
      purchase.seller.email = res.data.email;
      purchase.seller.phone = res.data.phone;
      purchase.seller.address = res.data.address;
      return purchase;
    })
  };
  auth.updateUserCart = function(purchase,currentUser,good){
    // checks to see if the good the user is adding is already in the cart
    // only compares by good_id, which means that the price should be the same
    // bc if a user wants to update the price of a good they must create a 
    // new listing of that good, thus good_id will be diff
    var inCart = false;
    for(var i = 0,len=currentUser.cart.length;i<len;i++){
      if(purchase.good_id==currentUser.cart[i].good_id){
        inCart = true;
        currentUser.cart[i].quantity = parseInt(purchase.quantity)+parseInt(currentUser.cart[i].quantity);
        currentUser.cart[i].price = parseFloat(good.pricePerUnit);
        return
      }
    }
    if(!inCart){
      currentUser.cart.push(purchase)
    }
    return currentUser;
  }
  // this function takes the current users id and an array of conversations that contain that user
  // then iterates over the array and stores all the users that are the current user
  auth.findMessageRecipients = function(user_id,convos){
    var recipients = [];
    var convoLookup = {};
    for(var i = 0;i<convos.length;i++){
      if(convos[i].participants[0]==user_id){
        recipients.push(convos[i].participants[1])
        convoLookup[convos[i].participants[1]] = convos[i]._id
      }else{
        recipients.push(convos[i].participants[0])
        convoLookup[convos[i].participants[0]] = convos[i]._id
      }
    }
    return [recipients,convoLookup];
  }

  auth.matchRecipientsToMessages = function(){

  }

  // api calls
  auth.userLookUp = function(user){
    return $http.get('/api/users/'+user).success(function(data){
      return data;
    })
  };
  auth.getByIds = function(user_ids){
    return $http.get('/api/users/ids',{params: { user_ids: user_ids }})
    .success(function(res){
      return res;
    })
    .error(function(err){
      return err;
    })
  }
  auth.getImagesByOwner = function(user_id){
    return $http.get('/api/images/'+user_id)
    .success(function(res){
      console.log(res);
      return res;
    })
    .error(function(err){
      console.log(err)
      return err;
    })
  }
  auth.userUpdate = function(user){
    return $http.post('/api/users/update', {user:user}).success(function(data){
      return data.token;
    })
  }
  auth.search = function(term){
    return $http.get('/api/users/search/'+term).success(function(res){
      return res;
    })
  }
  auth.register = function(user){
    return $http.post('/api/users/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  };
  auth.logIn = function(user){
    return $http.post('/api/users/login', user).success(function(data){
      auth.saveToken(data.token);
    });
  };
  auth.logOut = function(){
    $window.localStorage.removeItem('farmers-market-token');
  };
  auth.findResetToken = function(token){
    return $http.get('/api/users/reset/'+token)
    .success(function(res){
      return res;
    }).error(function(err){
      return err;
    })
  }
  auth.sendResetPasswordEmail = function(email){
    return $http.post('/api/users/forgot',{email:email})
    .success(function(res){
      return res;
    }).error(function(err){
      return err;
    })
  }
  auth.updatePassword = function(password,confirm,token){
    return $http.post('/api/users/reset/'+token,{password:password,confirm:confirm})
    .success(function(res){
      auth.saveToken(res.token);
      return res;
    })
    .error(function(err){
      return err;
    })
  };
  auth.sendNewFarmerEmail = function(user){
    return $http.put('/api/users/email/farmer',{user:user})
    .success(function(res){
      return res;
    })
    .error(function(err){
      return err;
    })
  };
  auth.sendNewuserEmail = function(user){
    return $http.put('/api/users/email/user',{user:user})
    .success(function(res){
      return res;
    })
    .error(function(err){
      return err;
    })
  }
  auth.getConversationId = function(users){
    return $http.put('/api/conversations/getConversation',{users:users})
    .success(function(res){
      return res;
    })
    .error(function(err){
      return err;
    })
  };
  auth.getInbox = function(user_id){
    return $http.get('/api/conversations/getInbox/'+user_id)
    .success(function(res){
      return res;
    })
  };
  auth.getMessages = function(convo_id){
    return $http.get('/api/messages/get/'+convo_id)
    .success(function(res){
      return res;
    })
    .error(function(err){
      return err;
    })
  }
  auth.sendNewMessage = function(message){
    return $http.post('/api/messages/new',message)
    .success(function(res){
      return res;
    })
    .error(function(err){
      return err;
    })
  }
  return auth;
}