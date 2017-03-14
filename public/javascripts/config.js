angular.module('farmersMarket.config', [])
.config(configure)


function configure($stateProvider, $urlRouterProvider){
	$stateProvider
    .state('home', {
      url: '/home',
      templateUrl: 'views/home.html',
      controller: 'MainCtrl',
      resolve: {
        goodPromise: ['goodsService', function(goodsService){
          return goodsService.getAll();
        }]
      }
    })

    // users reorder
    .state('reorder', {
      url: '/reorder/{id}',
      templateUrl: 'views/reorder.html',
      controller: 'ReorderCtrl',
      controllerAs: 'reorder',
      resolve: {
        orders: ['$stateParams','goodsService',function($stateParams,goodsService){
          return goodsService.getPurchases($stateParams.id).then(function(res){
            return goodsService.getByIDs(goodsService.prepPurchasesForReorders(res)).then(function(res){
              return res;
            })
          })
        }]
      }
    })

    // list goods by type (meat, produce etc)
    .state('goods', {
		  url: '/goods/{type}',
		  templateUrl: 'views/goods.html',
		  controller: 'GoodsCtrl',
      controllerAs: 'goods',
      resolve: {
        goods: ['$stateParams', 'goodsService', function($stateParams, goodsService) {
          return goodsService.getByType($stateParams.type);
        }]
      }
		})

    // users edit
    .state('edit', {
      url: '/users/edit',
      templateUrl: 'views/edit.html',
      controller: 'EditProfileCtrl',
      controllerAs: 'edit'
    })

    // get users page
    .state('users', {
      url: '/users/{id}',
      templateUrl: 'views/users.html',
      controller: 'UserCtrl',
      controllerAs: 'user',
      resolve: {
        good: ['$stateParams', 'goodsService', function($stateParams, goodsService) {
          return goodsService.getByUser($stateParams.id);
        }],
        user: ['$stateParams', 'auth', function($stateParams, auth) {
          return auth.userLookUp($stateParams.id);
        }],
        purchases: ['$stateParams', 'goodsService', function($stateParams,goodsService){
          return goodsService.getPurchases($stateParams.id);
        }]
      }
    })

    // single good by id
    .state('good', {
      url: '/{user}/{id}',
      templateUrl: 'views/good.html',
      controller: 'GoodCtrl',
      controllerAs: 'good',
      resolve: {
        good: ['$stateParams', 'goodsService', function($stateParams, goodsService) {
          return goodsService.get($stateParams.id);
        }]
      }
    })

    // users cart
    .state('cart', {
      url: '/cart',
      templateUrl: 'views/cart.html',
      controller: 'CartCtrl',
      controllerAs: 'cart'
    })

    // users search
    .state('search', {
      url: '/search',
      templateUrl: 'views/search.html',
      controller: 'SearchCtrl',
      controllerAs: 'search'
    })

    // users favorites
    .state('favorites', {
      url: '/favorites',
      templateUrl: 'views/favorites.html',
      controller: 'FavoritesCtrl',
      controllerAs: 'favorites',
      resolve: {
        favorites: ['goodsService','auth', function(goodsService,auth){
          return goodsService.getByIDs(auth.currentUser().favorites).then(function(res){
            return res;
          })
        }]
      }
    })

    // redirect after successful order
    .state('successfulOrder', {
      url: '/successfulOrder',
      templateUrl: 'views/successfulOrder.html',
      controller: 'SuccessCtrl',
      controllerAs: 'success'
    })


    // create new good
    .state('new', {
      url: '/new',
      templateUrl: 'views/new.html',
      controller: 'NewGoodCtrl',
      controllerAs: 'goods'
    })
    
    // update specific good
    .state('update', {
      url: '/goods/{id}/update',
      templateUrl: 'views/update.html',
      controller: 'UpdateGoodCtrl',
      controllerAs: 'good',
      resolve: {
        good: ['$stateParams', 'goodsService', function($stateParams, goodsService) {
          return goodsService.get($stateParams.id);
        }],
        user: ['$stateParams', 'auth', function($stateParams, auth) {
          return auth.userLookUp($stateParams.id);
        }]
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: 'views/login.html',
      controller: 'AuthCtrl',
      controllerAs: 'auth',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    })
    .state('register', {
      url: '/register',
      templateUrl: 'views/register.html',
      controller: 'AuthCtrl',
      controllerAs: 'auth',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    });

  $urlRouterProvider.otherwise('home');
}