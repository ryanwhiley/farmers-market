angular.module('farmersMarket.auth.controller', [])

.controller('AuthCtrl',AuthCtrl)
.controller('SuccessCtrl',SuccessCtrl)
.controller('ForgotPwCtrl',ForgotPwCtrl)
.controller('ResetPwCtrl',ResetPwCtrl)
.controller('NewFarmerCtrl',NewFarmerCtrl)
.controller('NewUserCtrl',NewUserCtrl)

function AuthCtrl($scope, $state, auth){
  var vm = this;
  vm.user = {farmer: 0, cart: []};
  vm.isLoggedIn = auth.isLoggedIn;
  vm.register = register;
  vm.logIn = logIn;

  function register(){
    vm.user.farmer ? vm.user.farmer = 1 : vm.user.farmer = 0
    auth.register(vm.user).error(function(error){
      vm.error = error;
    }).then(function(){
      if(vm.user.farmer===1){
        $state.go('newFarmer');
      }else{
        $state.go('newUser');
      }
    });
    // if(vm.user.farmer===0){
    //   auth.sendNewFarmerEmail(vm.user);
    // }else{
    //   auth.sendNewUserEmail(vm.user);
    // }
  }

  function logIn(){
    auth.logIn(vm.user).error(function(error){
      vm.error = error;
    }).then(function(){
      $state.go('home');
    });
  }

}

// template -> forgot.html
// url -> /forgot 
// |actions|
// users -> can reset pw by sending email
function ForgotPwCtrl(auth){
  var vm = this;
  vm.resetPassword = resetPassword;
  vm.requiredEmail = '';
  vm.sentEmail = false;

  function resetPassword(){
    auth.sendResetPasswordEmail(vm.requiredEmail)
    .then(function(res){
      vm.sentEmail = true;
      vm.requiredEmail = '';
      vm.error = false;
    }).catch(function(err){
      vm.error = err.data.error;
    })
  }
}

function ResetPwCtrl($state, auth, $stateParams){
  var vm = this;
  vm.password = '';
  vm.confirm = '';
  vm.successfulPasswordUpdate = false;
  vm.updatePassword = updatePassword;

  function updatePassword(){
    auth.updatePassword(vm.password,vm.confirm,$stateParams.token)
    .then(function(res){
      vm.successfulPasswordUpdate = true;
      setTimeout(function(){
        $state.go('home');
        vm.successfulPasswordUpdate = false;
      },3000);
    })
    .catch(function(err){
      vm.error = err.data.error;
    })
  }
}


function SuccessCtrl(){
}

// template -> newFarmer.html
// url -> /newFarmer
// |actions|
// when farmer first signs up theyre taken here and there should be a slideshow or something that shows them useful stuff
function NewFarmerCtrl(auth){
  var vm = this;
  vm.currentUser = auth.currentUser();
}

// template -> newUser.html
// url -> /newUser 
// |actions|
// welcomes users when they sign up, prolly no slideshow but useful links. most popular goods maybe
function NewUserCtrl(auth, goodsService){
  var vm = this;
  vm.currentUser = auth.currentUser();
  vm.mostPopular = [];
  goodsService.mostPopular(3)
  .then(function(res){
    goodsService.getByIDs(res.data)
    .then(function(goods){
      vm.mostPopular = goods;
    })
  })
}




