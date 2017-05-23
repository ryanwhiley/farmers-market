angular.module('farmersMarket.nav', [])

.controller('NavCtrl',NavCtrl)

function NavCtrl($scope, $state, $location, auth){
	$scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = logOut;


  function logOut(){
  	auth.logOut();
  	$state.go('home');
  }

}
