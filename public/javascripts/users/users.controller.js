angular.module('farmersMarket.users.controller', [])

.controller('UserCtrl',UserCtrl)
.controller('EditProfileCtrl',EditProfileCtrl)


// template -> users.html
// url -> /users/{id}
// |actions|
// farmers -> can view inventory and update inventory
// farmers -> can view orders sold
// users -> can view orders placed
function UserCtrl($scope, $stateParams, goodsService, purchaseService, auth, good, user, purchases){
	var vm = this;
	vm.user = user.data;
	vm.isLoggedIn = auth.isLoggedIn;
	vm.goods = good;
	vm.purchases = purchases;
	vm.currentUser = auth.currentUser();
	vm.goodToDelete = null;
	vm.orderSearch = '';
	vm.deliveryStatus = false;
	vm.sortBy = 'created_at';
	vm.reverseSort = false;

	// functions
	vm.deleteGood = deleteGood;
	vm.prepareForDeletion = prepareForDeletion;
	vm.theyDontWantToDeleteThisGood = theyDontWantToDeleteThisGood;
	vm.updateDeliveryStatus = updateDeliveryStatus;
	vm.updateSort = updateSort;

	function deleteGood(good){
		goodsService.remove(good).then(function(res){
			goodsService.getByUser($stateParams.id).then(function(res){
				vm.goods = res;
				vm.goodToDelete = null;
			})
		})
	}

	function prepareForDeletion(good){
		vm.goodToDelete = good;
	}

	function theyDontWantToDeleteThisGood(){
		vm.goodToDelete = null;
	}

	function updateDeliveryStatus(purchase){
		purchase.delivered = (purchase.delivered == "true");
		purchaseService.updatePurchase(purchase)
		.error(function(err){
			console.log(err);
		})
	}

	function updateSort(sort){
		if(sort==vm.sortBy){
			vm.reverseSort = !vm.reverseSort;
		}else{
			vm.sortBy = sort;
		}
	}
}

// template -> edit.html
// url -> /edit
// |actions|
// users -> can edit profile settings
function EditProfileCtrl(auth){
	var vm = this;
	vm.currentUser = auth.currentUser();
	vm.success = '';

	vm.submitEdits = submitEdits;

	function submitEdits(){
		auth.userUpdate(vm.currentUser).then(function(res){
			auth.updateToken(res.data.token);
			vm.success = 'Profile successfully updated!';
		});
	}
}
