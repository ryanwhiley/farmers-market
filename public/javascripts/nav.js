angular.module('farmersMarket.nav', [])

.controller('NavCtrl',NavCtrl)

function NavCtrl($scope, $state, auth){
	$scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = logOut;

  function logOut(){
  	auth.logOut();
  	$state.go('home');
  }

}