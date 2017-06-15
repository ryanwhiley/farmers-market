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
  auth.buildPurchaseObject = function(good,currentUser,userQuantity){
    var purchase = {};
    purchase.good = good.name;
    purchase.good_id = good._id;
    purchase.buyer = currentUser.username;
    purchase.quantity = parseInt(userQuantity);
    purchase.price = parseFloat(good.pricePerUnit);
    return this.userLookUp(good.seller).then(function(res){
      purchase.seller = {};
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

  // api calls
  auth.userLookUp = function(user){
    return $http.get('/api/users/'+user).success(function(data){
      return data;
    })
  };
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
  return auth;
}