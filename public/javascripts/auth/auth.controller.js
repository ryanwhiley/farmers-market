angular.module('farmersMarket.auth.controller', [])

.controller('AuthCtrl',AuthCtrl)
.controller('SuccessCtrl',SuccessCtrl)
.controller('ForgotPwCtrl',ForgotPwCtrl)
.controller('ResetPwCtrl',ResetPwCtrl)

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
      $state.go('home');
    });
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
  vm.updatePassword = updatePassword;

  function updatePassword(){
    console.log(vm.password,vm.confirm);
    auth.updatePassword(vm.password,vm.confirm,$stateParams.token)
    .then(function(res){
      $state.go('home');
    })
    .catch(function(err){
      vm.error = err.data.error;
    })
  }
}


function SuccessCtrl(){
  console.log('yeah');
}