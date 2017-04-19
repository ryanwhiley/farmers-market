angular.module('farmersMarket.auth.service', [])

.factory('auth',auth)

function auth($http, $window){
	var auth = {};
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
  auth.userLookUp = function(user){
    return $http.get('/users/'+user).success(function(data){
      return data;
    })
  };
  auth.userUpdate = function(user){
    return $http.post('/users/update', {user:user}).success(function(data){
      return data.token;
    })
  }
  auth.search = function(term){
    return $http.get('/users/search/'+term).success(function(res){
      return res;
    })
  }
  auth.register = function(user){
    return $http.post('/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  };
  auth.logIn = function(user){
    return $http.post('/login', user).success(function(data){
      auth.saveToken(data.token);
    });
  };
  auth.logOut = function(){
    $window.localStorage.removeItem('farmers-market-token');
  };
  auth.findResetToken = function(token){
    return $http.get('/reset/'+token)
    .success(function(res){
      return res;
    }).error(function(err){
      return err;
    })
  }
  auth.sendResetPasswordEmail = function(email){
    return $http.post('/forgot',{email:email})
    .success(function(res){
      return res;
    }).error(function(err){
      return err;
    })
  }
  auth.updatePassword = function(password,confirm,token){
    return $http.post('/reset/'+token,{password:password,confirm:confirm})
    .success(function(res){
      auth.saveToken(res.token);
      return res;
    })
    .error(function(err){
      return err;
    })
  }
  return auth;
}