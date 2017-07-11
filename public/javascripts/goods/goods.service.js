angular.module('farmersMarket.goods.service', [])

.factory('goodsService',goodsService)

function goodsService($http,auth){
	var o = {
  	goods: [
	  ],
    categories: {
      'produce':['Fruit','Vegetables','Greens','Mushrooms','Garlic','Onions','Other'],
      'dairy':['Milk','Eggs','Cheese','Yogurt','Butter','Other'],
      'meat':['Poultry','Beef','Pork','Fish','Other'],
      'other':['Other']
    }
  };
  // other functions that dont hit the api
  o.prepPurchasesForReorders = function(purchases){
    var purchase_ids = [];
    var seen = {};
    for(var i = 0,len=purchases.length;i<len;i++){
      if(!seen[purchases[i].good_id]){
        purchase_ids.push(purchases[i].good_id);
        seen[purchases[i].good_id] = true;
      }
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
  };
  o.prepareGoodsByType = function(goods){
    var categoriesGroupings = {};
    for(var i = 0;i<goods.length;i++){
      if(categoriesGroupings[goods[i].category.toLowerCase()]){
        categoriesGroupings[goods[i].category.toLowerCase()].push(goods[i]);
      }else{
        categoriesGroupings[goods[i].category.toLowerCase()] = [goods[i]]
      }
    }
    return categoriesGroupings;
  };

  // api calls
  o.getAll = function() {
    return $http.get('/api/goods').success(function(data){
      angular.copy(data, o.goods);
    });
  };
  o.search = function(term){
    return $http.get('/api/goods/search/'+term).success(function(res){
      return res;
    })
  }
  o.create = function(good) {
    return $http.post('/api/goods', good, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      o.goods.push(data);
    })
  };
  // =================================================
  // currently not using, replaced by auth.userUpdate()
  // =================================================
  o.addToCart = function(user){
    return $http.post('/api/users/addToCart', {user: user}).success(function(data){
      return data.token;
    })
  };
  // =================================================
  // =================================================
  // =================================================
  o.get = function(id) {
    return $http.get('/api/goods/' + id).then(function(res){
      return res.data;
    });
  };
  o.getByType = function(type){
    return $http.get('/api/goods/type/'+type).then(function(res){
      return res.data;
    })
  };
  // purpose -> gets goods by user. ie get all goods that i (or someone else) has posted 
  // args:
  // user_id (string) -> obvi. looks up goods by user_id rather than user name like it used to
  o.getByUser = function(user_id){
    console.log(user_id);
    return $http.get('/api/users/' + user_id + '/goods').then(function(res){
      return res.data;
    });
  };
  o.getByIDs = function(good_ids){
    return $http.get('/api/goods/ids', {params: { good_ids: good_ids }}).then(function(res){
      return res.data;
    })
  },
  o.remove = function(good){
    return $http.delete('/api/goods/' + good).then(function(res){
      return res.data;
    });
  };
  o.getPurchases = function(user_id){
    return $http.get('/api/purchases/'+user_id).then(function(res){
      return res.data;
    })
  }
  o.purchase = function(purchase){
    return $http.post('/api/purchases', purchase, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      return data;
    }).error(function(err){
      console.log(err,'Error purchasing good');
    })
  };
  o.sendLowStockEmail = function(goods,seller_email){
    if(goods.length){
      return $http.put('/api/purchases/lowStock', {goods:goods,seller:seller_email});
    }
  };
  o.purchaseEmail = function(goods, buyer, seller, toSeller){
    return $http.put('/api/purchases/email', {goods: goods, buyer: buyer, seller: seller, toSeller: toSeller});
  };
  o.update = function(good){
    return $http.put('/api/goods/update',{good:good}).then(function(res){
      return res.data;
    })
  };
  o.mostPopular = function(count){
    return $http.get('/api/purchases/mostPopular/'+count)
    .then(function(res){
      return res;
    })
  };

  return o;
}
