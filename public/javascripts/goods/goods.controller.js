angular.module('farmersMarket.goods.controller', [])

.controller('GoodsCtrl',GoodsCtrl)
.controller('NewGoodCtrl',NewGoodCtrl)
.controller('GoodCtrl',GoodCtrl)
.controller('UpdateGoodCtrl',UpdateGoodCtrl)
.controller('CartCtrl',CartCtrl)
.controller('ReorderCtrl',ReorderCtrl)
.controller('FavoritesCtrl',FavoritesCtrl)
.controller('SearchCtrl',SearchCtrl)


// ===============================
// ========= GOODS CTRL ==========
// ===============================
// template -> goods.html
// url -> /goods/{type}
// actions -> list out all goods by type
function GoodsCtrl($state, goodsService, goods, auth){
	// $scope.good = good;
	var vm = this;
	vm.goods = goodsService.prepareGoodsByType(goods);
	vm.currentUser = auth.currentUser();

	vm.favoriteGood = favoriteGood;
	vm.unfavoriteGood = unfavoriteGood;

	goodsService.mostPopular(3)
  .then(function(res){
    goodsService.getByIDs(res.data)
    .then(function(res){
      console.log(res);
    })
  })

	function favoriteGood(good_id){
		vm.currentUser.favorites.push(good_id);
		auth.userUpdate(vm.currentUser).then(function(res){
			auth.updateToken(res.data.token);
		})
	}

	function unfavoriteGood(good_id){
		vm.currentUser.favorites.splice(vm.currentUser.favorites.indexOf(good_id),1);
		auth.userUpdate(vm.currentUser).then(function(res){
			auth.updateToken(res.data.token);
		})
	}
}

// ===============================
// ======= NEW GOOD CTRL =========
// ===============================
// template -> new.html
// url -> /new
// actions -> create new good
function NewGoodCtrl($state, goodsService, auth){
	var vm = this;
	// variable declarations
	vm.isLoggedIn = auth.isLoggedIn;
	vm.goodDetails = {name: '',pricePerUnit: 0, description: '', type: '', category: '', unitOfMeasurement: '', unitOfSale: '', quantityForSale: 1, can_deliver: false, delivery_fee: 0, delivery_time: ''};
	vm.categories = goodsService.categories;
	vm.currentUser = auth.currentUser();

	// function declarations
	vm.newGood = newGood;
	vm.goodsFieldCheck = goodsFieldCheck;

	function goodsFieldCheck(){
		if(!vm.goodDetails.name||
			vm.goodDetails.pricePerUnit < 0 || !vm.goodDetails.pricePerUnit||
			!vm.goodDetails.description||
			!vm.goodDetails.type||
			!vm.goodDetails.category||
			!vm.goodDetails.unitOfMeasurement||
			!vm.goodDetails.unitOfSale||
			(vm.goodDetails.can_deliver&&(!vm.goodDetails.delivery_fee < 0 || !vm.goodDetails.delivery_time))||
			vm.goodDetails.quantityForSale < 0 || !vm.goodDetails.quantityForSale
			){
			return false;
		}else{
			return true;
		}
	}

	function newGood(){
		if(vm.currentUser.farmer&&vm.goodsFieldCheck()){
	    goodsService.create({
	    	name: vm.goodDetails.name,
	    	pricePerUnit: vm.goodDetails.pricePerUnit, 
	    	description: vm.goodDetails.description, 
	    	type: vm.goodDetails.type,
	    	category: vm.goodDetails.category,
	    	quantityForSale: vm.goodDetails.quantityForSale,
	    	unitOfMeasurement: vm.goodDetails.unitOfMeasurement,
	    	unitOfSale: vm.goodDetails.unitOfSale,
	    	can_deliver: vm.goodDetails.can_deliver,
				delivery_fee: vm.goodDetails.delivery_fee,
	    	delivery_time: vm.goodDetails.delivery_time
	    })
	  	vm.goodDetails = {name: '',pricePerUnit: 0, description: '', type: '', category: '', unitOfMeasurement: '', unitOfSale: '', quantityForSale: 1, can_deliver: false, delivery_fee: 0, delivery_time: ''};
	  	$state.go('home');
		}else{
			if(!vm.currentUser.farmer){
				vm.error = 'Must be a farmer to list goods.';
			}else{
				vm.error = 'Please properly fill out all fields.';
			}
		}
	}
}


// ===============================
// =========== GOOD CTRL =========
// ===============================
// template -> good.html
// url -> /{user}/{good._id}
// actions -> add good to cart if user
function GoodCtrl(goodsService,good,auth){
	var vm = this;
	// variables
	vm.userQuantity = 1;
	vm.quantity = [1,2,3,4,5,6,7,8,9,10];
	vm.purchase = {};
	vm.isLoggedIn = auth.isLoggedIn;
	vm.currentUser = auth.currentUser();
	console.log(vm.currentUser);
	vm.good = good;
	vm.success = '';
	vm.error = '';

	// functions
	vm.purchaseGood = purchaseGood;
	vm.buildPurchaseObject = buildPurchaseObject;
	vm.addToCart = addToCart;
	vm.updateUserCart = updateUserCart;

	function addToCart(){
		if(vm.good.delivery==''||!vm.good.delivery){
			vm.error = 'Please select pickup or delivery to add this to your cart.';
			return;
		}else if(!vm.currentUser){
			vm.error = 'Please login to add this to your cart.';
			return;
		}
		vm.buildPurchaseObject().then(function(res){
			vm.updateUserCart();
			vm.success = 'Successfully added to cart!';
			auth.userUpdate(vm.currentUser).then(function(res){
				auth.updateToken(res.data.token);
			})
		})
	}

	function updateUserCart(){
		var inCart = false;
		for(var i = 0,len=vm.currentUser.cart.length;i<len;i++){
			if(vm.purchase.good_id==vm.currentUser.cart[i].good_id){
				inCart = true;
				vm.currentUser.cart[i].quantity = parseInt(vm.purchase.quantity)+parseInt(vm.currentUser.cart[i].quantity);
				vm.currentUser.cart[i].price = parseFloat(vm.good.pricePerUnit);
				return
			}
		}
		if(!inCart){
			vm.currentUser.cart.push(vm.purchase)
		}
	}

	function buildPurchaseObject(){
		vm.purchase.good = vm.good.name;
		vm.purchase.good_id = vm.good._id;
		vm.purchase.buyer = vm.currentUser.username;
		vm.purchase.quantity = parseInt(vm.userQuantity);
		vm.purchase.price = parseFloat(vm.good.pricePerUnit);
		return auth.userLookUp(vm.good.seller).then(function(res){
			vm.purchase.seller = {};
			vm.purchase.seller.name = res.data.username;
			vm.purchase.seller.email = res.data.email;
			vm.purchase.seller.phone = res.data.phone;
			vm.purchase.seller.address = res.data.address;
			return true;
		})
	}
	
	function purchaseGood(){
		vm.good.quantityForSale -= vm.userQuantity;
		vm.buildPurchaseObject();
		// update quantity in goods table
		goodsService.update(vm.good)
		// create row in purchase table
		goodsService.purchase(vm.purchase)
		// send seller and buyer emails
		auth.userLookUp(vm.good.seller).then(function(res){
			goodsService.purchaseEmail(vm.good, vm.currentUser, res.data);
			vm.success = 'Good successfully purchased, we have emailed you with details and notified the seller.';
		})
	}
}


// ===============================
// ========= UPDATE CTRL =========
// ===============================
// template -> update.html
// url -> /goods/{good._id}/update
// action -> update good if farmer
function UpdateGoodCtrl($state,goodsService,good,auth){
	var vm = this;
	vm.good = good;
	vm.currentUser = auth.currentUser();
	vm.categories = goodsService.categories;
	vm.error = '';
	if(vm.good.seller!=vm.currentUser.username){
		$state.go('home');
	}

	vm.updateGood = updateGood;

	function updateGood(){
		if(good.seller==vm.currentUser.username){
			vm.good.updated_at = new Date();
			goodsService.update(vm.good).then(function(res){
				if(res.ok){
					goodsService.get(vm.good._id).then(function(res){
						vm.good = res;
						vm.success = 'Successfully Updated';
					})
				}
			})
		}
	}
}



// =========================
// ======= CART CTRL =======
// =========================
// template -> cart.html
// url -> /cart
// action -> look at/update cart, purchase
function CartCtrl($state, goodsService, auth){
	// variable declarations
	var vm = this;
	vm.currentUser = auth.currentUser();
	vm.quantity = [1,2,3,4,5,6,7,8,9,10];
	vm.cart = [];
	vm.quantityPass = true;
	vm.totals = goodsService.calculateCartTotals(vm.currentUser.cart);

	// function declarations
	vm.buildGoodObject = buildGoodObject;
	vm.checkRemainingQuantity = checkRemainingQuantity;
	vm.prepareCart = prepareCart;
	vm.purchase = purchase;
	vm.sendPurchaseEmails = sendPurchaseEmails;
	vm.storePurchasesInPurchaseTable = storePurchasesInPurchaseTable;
	vm.updateRemainingQuantities = updateRemainingQuantities;
	vm.emptyUserCart = emptyUserCart;
	vm.removeFromCart = removeFromCart;
	vm.updateUserCart = updateUserCart;
	vm.getGoodsObject = getGoodsObject;

	// updates user row in table, updates web token, updates totals
	function updateUserCart(){
		auth.userUpdate(vm.currentUser).then(function(res){
			auth.updateToken(res.data.token);
		})
		vm.totals = goodsService.calculateCartTotals(vm.currentUser.cart);
	}

	// allows user to remove goods from cart
	// takes index of good to pop out of cart array
	function removeFromCart(index){
		vm.currentUser.cart.splice(index,1);
		vm.updateUserCart()
	}

	// ensures that the seller has the necessary quantity to make sales
	// if they do not, then will pop a flag notifying user
	function checkRemainingQuantity(){
		for(var i = 0,len=vm.currentUser.cart.length;i<len;i++){
			goodsService.get(vm.currentUser.cart[i].good_id).then(function(res){
				if(vm.currentUser.cart[i].quantity>res.quantityForSale){
					vm.quantityPass = false;
					return;
				}
			})
		}
	}

	// sorts cart by seller, so that we are not sending multiple emails to the same seller for the same sale.
	// will group goods by seller
	function prepareCart(){
		vm.cart = [{seller:vm.currentUser.cart[0].seller,goods:[vm.buildGoodObject(vm.currentUser.cart[0])]}];
		for(var i = 1,len = vm.currentUser.cart.length;i<len;i++){
			let inCart = false;
			for(var j = 0;j<vm.cart.length;j++){
				if(vm.cart[j].seller.name==vm.currentUser.cart[i].seller.name){
					inCart = true;
					vm.cart[j].goods.push(vm.buildGoodObject(vm.currentUser.cart[i]));
				}
			}
			if(inCart==false){
				vm.cart.push({seller:vm.currentUser.cart[i].seller,goods:[vm.buildGoodObject(vm.currentUser.cart[i])]})
			}
		}
	}

	// builds the goods object that goes in the cart
	function buildGoodObject(good){
		return {_id:good.good_id, name:good.good, price: good.price, quantity: good.quantity}
	}

	// figure it out stupid
	function sendPurchaseEmails(){
		for(var i = 0,len=vm.cart.length;i<len;i++){
			// goodsService.purchaseEmail(vm.cart[i].goods, vm.currentUser, vm.cart[i].seller, 1);
			vm.getGoodsObject(vm.cart[i].goods, vm.cart[i].seller);
		}
		goodsService.purchaseEmail(vm.cart, vm.currentUser, null, 0);
	}

	// fucking duh
	// iterates over users cart and send in individual goods.
	// have to update good before send to api because seller needs to be name rather than object
	function storePurchasesInPurchaseTable(){
		for(var i = 0,len=vm.currentUser.cart.length;i<len;i++){
			var goodObject = {buyer: vm.currentUser.cart[i].buyer,
												good:vm.currentUser.cart[i].good,
												good_id:vm.currentUser.cart[i].good_id,
												price:vm.currentUser.cart[i].price,
												quantity:vm.currentUser.cart[i].quantity,
												seller:vm.currentUser.cart[i].seller.name};
			// vm.updateRemainingQuantities(vm.currentUser.cart[i].good_id, vm.currentUser.cart[i].quantity)
			goodsService.purchase(goodObject);
		}
	}

	// !!!! CURRENTLY NOT IN USE !!!!
	// update sellers remaining quanitities after
	// need to get good object then update quantity here and then call update fx in service etc
	function updateRemainingQuantities(res){
		// res.quantityForSale = parseInt(res.quantityForSale)-parseInt(quantity);
		// goodsService.update(res);
	}

	// loads good obj from db
	// updates quantity remaining on backend
	// checks if seller has low stock and notifies em if they do
	// put both of these in same function to limit calls to db
	function getGoodsObject(goods, seller){
		var lowGoods = [];
		var counter = 0;
		goods.forEach(function(good){
			goodsService.get(good._id).then(function(res){
				counter++;
				res.quantityForSale = parseInt(res.quantityForSale)-parseInt(good.quantity);
				goodsService.update(res);
				if(res.quantityForSale<100){
					lowGoods.push(res);
				}
				if(counter===goods.length){
					goodsService.sendLowStockEmail(lowGoods,seller);
				}
			})
		})
	}

	// updates user on front end, then http post to update in db, then updates web token
	function emptyUserCart(){
		vm.currentUser.cart = [];
		auth.userUpdate(vm.currentUser).then(function(res){
			auth.updateToken(res.data.token);
			$state.go('successfulOrder');
		})
	}

	// kicks off whole purchase process
	// preps cart for emails
	// sends emails
	// creates purchase in purchase table
	// updates remaining quantity
	function purchase(){
		vm.prepareCart();
		vm.sendPurchaseEmails();
		vm.storePurchasesInPurchaseTable();
		vm.emptyUserCart();
	}
}


// =========================
// ===== REORDER CTRL ======
// =========================
function ReorderCtrl(orders){
	var vm = this;
	vm.orders = orders;
}


// ===========================
// ===== FAVORITES CTRL ======
// ===========================
function FavoritesCtrl(favorites){
	var vm = this;
	vm.favorites = favorites;
}

// ===========================
// ======= SERACH CTRL =======
// ===========================
function SearchCtrl(goodsService, auth){
	var vm = this;
	vm.searchTerm = '';
	vm.userMatches = [];
	vm.goodMatches = [];

	vm.search = search;
	vm.searchUsers = searchUsers;
	vm.searchGoods = searchGoods;

	function search(){
		vm.searchGoods();
		vm.searchUsers();
	}

	function searchGoods(){
		if(vm.searchTerm){
			goodsService.search(vm.searchTerm).then(function(res){
				vm.goodMatches = res.data;
			})
		}else{
			vm.goodMatches = [];
		}
	}

	function searchUsers(){
		if(vm.searchTerm){
			auth.search(vm.searchTerm).then(function(res){
				vm.userMatches = res.data;
			})
		}else{
			vm.userMatches = [];
		}
	}
}