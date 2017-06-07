angular.module('farmersMarket.purchases.service', [])

.factory('purchaseService',purchaseService)

function purchaseService($http){
	var o = {};


	// api calls
	o.updatePurchase = function(purchase){
		return $http.put('/api/purchases/update',{purchase:purchase}).then(function(res){
      return res.data;
    })
	}
	return o;
}