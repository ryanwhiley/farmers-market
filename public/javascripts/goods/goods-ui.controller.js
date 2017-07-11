angular.module('farmersMarket.goods-ui.controller', [])

.controller('pagination-controller', function ($scope, $log) {
  $scope.totalItems = 64;
  $scope.currentPage = 4;

  $scope.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
  };

  $scope.pageChanged = function() {
    $log.log('Page changed to: ' + $scope.currentPage);
  };

  $scope.maxSize = 1;
  $scope.bigTotalItems = 175;
  $scope.bigCurrentPage = 1;
})

.controller('TabsCtrl', function ($scope, $window) {
  $scope.tabs = [
    { title:'', content: "/images/foodphotos/blueberries.jpg" },
    { title:'', content: "/images/foodphotos/brown-eggs.jpg" },
    { title:'', content: "/images/foodphotos/chestnuts.jpg" },
    { title:'', content: "/images/foodphotos/green-peas.jpg" },
    { title:'', content: "/images/foodphotos/pak-choi.jpg" }
  ];
})

.controller('AccordionCtrl', function ($scope) {
  $scope.oneAtATime = true;

  $scope.status = {
    isCustomHeaderOpen: false,
    isFirstOpen: true,
    isFirstDisabled: false
  };
})

.controller('ButtonsCtrl', function ($scope) {
  $scope.radioModel = 'pickup';
});
