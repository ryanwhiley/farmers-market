angular.module('farmersMarket.auth.controller', [])

.controller('AuthCtrl',AuthCtrl)
.controller('SuccessCtrl',SuccessCtrl)

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


function SuccessCtrl(){
  console.log('yeah');
}