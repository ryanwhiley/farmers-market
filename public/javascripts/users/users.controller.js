angular.module('farmersMarket.users.controller', [])

.controller('UserCtrl',UserCtrl)
.controller('EditProfileCtrl',EditProfileCtrl)


// template -> users.html
// url -> /users/{id}
// |actions|
// farmers -> can view inventory and update inventory
// farmers -> can view orders sold
// users -> can view orders placed
function UserCtrl($scope, $stateParams, goodsService, auth, good, user, purchases){
	var vm = this;
	vm.user = user.data;
	vm.isLoggedIn = auth.isLoggedIn;
	vm.goods = good;
	vm.purchases = purchases;
	vm.currentUser = auth.currentUser();

	vm.deleteGood = deleteGood;

	function deleteGood(good){
		goodsService.remove(good).then(function(res){
			goodsService.getByUser($stateParams.id).then(function(res){
				vm.goods = res;
			})
		})
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
			console.log(res.data.token);
			auth.updateToken(res.data.token);
			vm.success = 'Profile successfully updated!';
		});
	}
}
