angular.module('farmersMarket', ['ui.router',
  'farmersMarket.config',
  'farmersMarket.nav',
  'farmersMarket.directives',
  'farmersMarket.auth.controller',
  'farmersMarket.auth.service',
  'farmersMarket.goods.controller',
  'farmersMarket.goods.service',
  'farmersMarket.users.controller'])

// config
.controller('MainCtrl',MainCtrl)
.filter('goodsFilter',goodsFilter)

// .run(function() {
//   console.log(angular)
//   debugger;
// })
// INJECTIONS
// configure.$inject = [$stateProvider, $urlRouterProvider];
// MainCtrl.$inject = [$scope,goods,auth];
// GoodsCtrl.$inject = [$scope, goods, good];
// AuthCtrl.$inject = [$scope, $state, auth];
// NavCtrl.$inject = [$scope, auth];
// goods.$inject = [$http,auth];
// auth.$inject = [$http, $window];

// FUNCTIONS
function MainCtrl($scope,goodsService,auth){
  var vm = this;
  vm.isLoggedIn = auth.isLoggedIn;
	// $scope.isLoggedIn = auth.isLoggedIn;
  vm.goods = goodsService.goods;
  // $scope.goods = goods.goods;
  vm.price = '';
  vm.type = '';
  // $scope.price = false;
}


function goodsFilter(){
  return function(goods,price,type){
    var filtered = [];
    for(var i = 0,len=goods.length;i<len;i++){
      if(parseInt(goods[i].price)<parseInt(price)||price==''
        &&goods[i].type.indexOf(type)>=0
        ){
        filtered.push(goods[i]);
      }
    }
    return filtered;
  }
}
