angular.module('farmersMarket.goods-ui.controller', [])

.controller('pager-controller', function($scope) {
  $scope.totalItems = 64;
  $scope.currentPage = 1;
});
