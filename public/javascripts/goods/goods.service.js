angular.module('farmersMarket.goods.service', [])

.factory('goodsService',goodsService)

function goodsService($http,auth){
	var o = {
  	goods: [
	  ],
    categories: {
      'produce':['Fruit','Vegetables','Greens','Mushrooms','Garlic','Onions','Other'],
      'dairy':['Milk','Eggs','Cheese','Yogurt','Butter','Other'],
      'meat':['Poultry','Beef','Pork','Other'],
      'other':['Other']
    }
  };
  // other functions that dont hit the api
  o.prepPurchasesForReorders = function(purchases){
    var purchase_ids = [];
    for(var i = 0,len=purchases.length;i<len;i++){
      purchase_ids.push(purchases[i].good_id);
    }
    return purchase_ids;
  };
  o.calculateCartTotals = function(cart){
    var totals = {totalPrice: 0, totalQuantity: 0};
    for(var i = 0,len=cart.length;i<len;i++){
      totals.totalPrice = totals.totalPrice+(parseFloat(cart[i].price)*parseFloat(cart[i].quantity));
      totals.totalQuantity = totals.totalQuantity+parseFloat(cart[i].quantity);
    }
    return totals;
  }

  // api calls
  o.getAll = function() {
    return $http.get('/goods').success(function(data){
      angular.copy(data, o.goods);
    });
  };
  o.search = function(term){
    console.log(term);
    return $http.get('/goods/search/'+term).success(function(res){
      return res;
    })
  }
  o.create = function(good) {
    return $http.post('/goods', good, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      o.goods.push(data);
    })
  };
  // currently not using, replaced by auth.userUpdate()
  o.addToCart = function(user){
    return $http.post('/users/addToCart', {user: user}).success(function(data){
      return data.token;
    })
  };
  o.get = function(id) {
    return $http.get('/goods/' + id).then(function(res){
      return res.data;
    });
  };
  o.getByType = function(type){
    return $http.get('/'+type).then(function(res){
      return res.data;
    })
  };
  o.getByUser = function(user){
    return $http.get('/users/' + user + '/goods').then(function(res){
      return res.data;
    });
  };
  o.getByIDs = function(good_ids){
    return $http.get('/goods/ids', {params: { good_ids: good_ids }}).then(function(res){
      return res.data;
    })
  },
  o.remove = function(good){
    return $http.delete('/goods/' + good).then(function(res){
      return res.data;
    });
  };
  o.getPurchases = function(user){
    return $http.get('/purchases/'+user).then(function(res){
      return res.data;
    })
  }
  o.purchase = function(purchase){
    console.log('c,sadfasd',1)
    return $http.post('/goods/purchase', purchase, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      console.log('c,sadfasd')
      return data;
    }).error(function(err){
      console.log(err,'Error purchasing good');
    })
  };
  o.purchaseEmail = function(goods, buyer, seller, toSeller){
    return $http.put('/email/purchase', {goods: goods, buyer: buyer, seller: seller, toSeller: toSeller});
  };
  o.update = function(good){
    return $http.put('/goods/update',{good:good}).then(function(res){
      return res.data;
    })
  }

  return o;
}