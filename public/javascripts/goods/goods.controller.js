angular.module('farmersMarket.goods.controller', [])

.controller('GoodsCtrl',GoodsCtrl)
.controller('NewGoodCtrl',NewGoodCtrl) //create good, still being used
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
function GoodsCtrl($state, $stateParams, goodsService, goods, auth){
	// $scope.good = good;
	var vm = this;
	vm.label = $stateParams.type;
	vm.goods = goodsService.prepareGoodsByType(goods);
	if(Object.keys(vm.goods).length===0){
		vm.goods[vm.label] = [];
		vm.emptyResults = true;
	}else{
		vm.emptyResults = false;
	}
	vm.currentUser = auth.currentUser();

	vm.favoriteGood = favoriteGood;
	vm.unfavoriteGood = unfavoriteGood;
	vm.addToCartDetails = addToCartDetails;

	// need to put this in auth.newUser ctrl
	// goodsService.mostPopular(3)
 //  .then(function(res){
 //    goodsService.getByIDs(res.data)
 //    .then(function(res){
 //      console.log(res);
 //    })
 //  })

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

	function addToCartDetails(good){

	}
}

// ===============================
// ======= NEW GOOD CTRL =========
// ===============================
// template -> new.html
// url -> /new
// actions -> create new good
function NewGoodCtrl($state, goodsService, auth, images){
	var vm = this;
	// variable declarations
	vm.isLoggedIn = auth.isLoggedIn;
	vm.goodDetails = {name: '',pricePerUnit: 0, description: '', type: '', category: '', unitOfMeasurement: '', unitOfSale: '', quantityForSale: 1, can_deliver: false, delivery_fee: 0, delivery_time: ''};
	vm.categories = goodsService.categories;
	vm.currentUser = auth.currentUser();
	vm.images = images.data;
	vm.selectedImages = [];
	vm.imageName = "";


	// function declarations
	vm.newGood = newGood;
	vm.goodsFieldCheck = goodsFieldCheck;
	vm.toggleImageInclusion = toggleImageInclusion;
	vm.reloadImages = reloadImages;

	// vm.imageChaneListner = imageChaneListner();
	$(document).on('change', '#file-input', function() {
    var file = $(this)[0]; // note the [0] to return the DOMElement from the jQuery object

    // if(vm.imageName){
    // 	file.files[0].name = vm.imageName+'.'+file.files[0].name.split('.')[1];
    // }
	  getSignedRequest(file.files[0]);
	});

	function getSignedRequest(file){
	  var xhr = new XMLHttpRequest();
	  xhr.open('GET', `/api/images/sign-s3?file-name=${file.name}&file-type=${file.type}&id=${vm.currentUser._id}`);
	  xhr.onreadystatechange = () => {
	    if(xhr.readyState === 4){
	      if(xhr.status === 200){
	        var response = JSON.parse(xhr.responseText);
	        uploadFile(file, response.signedRequest, response.url);
	      }
	      else{
	        alert('Could not get signed URL.');
	      }
	    }
	  };
	  xhr.send();
	}

	function uploadFile(file, signedRequest, url){
	  var xhr = new XMLHttpRequest();
	  xhr.open('PUT', signedRequest);
	  xhr.onreadystatechange = () => {
	    if(xhr.readyState === 4){
	      if(xhr.status === 200){
	        vm.reloadImages();
	      }else{

	      }
	    }
	  };
	  xhr.send(file);
	}

	function reloadImages(){
		auth.getImagesByOwner(vm.currentUser._id)
		.then(function(res){
      vm.images = res.data;
    })
	}

	function toggleImageInclusion(id){
		var index = vm.selectedImages.indexOf(id);
		if(index>=0){
			vm.selectedImages.splice(index,1);
		}else{
			vm.selectedImages.push(id);
		}
	}

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
	    	delivery_time: vm.goodDetails.delivery_time,
	    	images: vm.selectedImages
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
	vm.good = goodsService.convertImagesToObject(good);
	console.log(vm.good)
	vm.success = '';
	vm.error = '';

	// functions
	vm.addToCart = addToCart;

	// if we want to put add to cart functionality then we'll need to take some of these functions and put them into
	// a service
	// specifically -> addToCart, buildPurchaseObject, 
	function addToCart(){
		if(vm.good.seller._id==vm.currentUser._id){
			vm.error = 'You cannot purchase your own goods.';
			return;
		}else if(vm.good.delivery==''||!vm.good.delivery){
			vm.error = 'Please select pickup or delivery to add this to your cart.';
			return;
		}else if(!vm.currentUser){
			vm.error = 'Please login to add this to your cart.';
			return;
		} 
		
		// note: this purchase object is not the same object that it stored in the Purchase table. it is just stored in the cart for the user
		auth.buildPurchaseObject(vm.good,vm.currentUser._id,vm.userQuantity)
		.then(function(res){
			vm.purchase = res;
			console.log(vm.purchase);
			auth.updateUserCart(vm.purchase,vm.currentUser,vm.good);
			vm.success = 'Successfully added to cart!';
			vm.error = '';
			auth.userUpdate(vm.currentUser).then(function(res){
				auth.updateToken(res.data.token);
			})
		})
	}

	function successfulNotification(){
		vm.success = 'Good successfully purchased, we have emailed you with details and notified the seller.';
		setTimeout(function(){
			vm.success = '';
		},3000)
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
	if(vm.good.seller._id!=vm.currentUser._id){
		$state.go('home');
	}

	vm.updateGood = updateGood;

	function updateGood(){
		if(good.seller._id==vm.currentUser._id){
			vm.good.updated_at = new Date();
			goodsService.update(vm.good).then(function(res){
				if(res.ok){
					goodsService.get(vm.good._id).then(function(res){
						vm.good = res;
						vm.success = 'Successfully Updated';
					})
				}
			})
		}else{
			vm.error = 'You do not have permission to update this good. If you believe this is an issue you can contact us at hello@farmtomeal.com.';
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
	vm.submissionError = false;

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
	vm.checkQuantity = checkQuantity;

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

	// if a user edits the quantity they want, then
	// this function will ensure that the seller
	// has the necessary quantity
	function checkQuantity(good){
		good.error = false;
		vm.submissionError = false;
		goodsService.get(good.good_id)
		.then(function(res){
			if(!/^\d+$/.test(good.quantity)){
				good.error = 'Please ensure that quantity is all numbers.'
				vm.submissionError = true;
			}else if(good.quantity>res.quantityForSale){
				good.error = 'Please select a number less than '+res.quantityForSale+' in order to purchase this.';
				vm.submissionError = true;
			}
		})
	}

	// sorts cart by seller, so that we are not sending multiple emails to the same seller for the same sale.
	// will group goods by seller
	function prepareCart(){
		vm.cart = [{seller:vm.currentUser.cart[0].seller,goods:[vm.buildGoodObject(vm.currentUser.cart[0])]}];
		for(var i = 1,len = vm.currentUser.cart.length;i<len;i++){
			let inCart = false;
			for(var j = 0;j<vm.cart.length;j++){
				if(vm.cart[j].seller._id==vm.currentUser.cart[i].seller._id){
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
			goodsService.purchaseEmail(vm.cart[i].goods, vm.currentUser, vm.cart[i].seller, 1);
			vm.getGoodsObject(vm.cart[i].goods, vm.cart[i].seller);
		}
		// goodsService.purchaseEmail(vm.cart, vm.currentUser, null, 0);
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
												seller:vm.currentUser.cart[i].seller._id};
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
					goodsService.sendLowStockEmail(lowGoods,seller.email);
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
		if(!vm.submissionError){
			vm.prepareCart();
			vm.sendPurchaseEmails();
			vm.storePurchasesInPurchaseTable();
			vm.emptyUserCart();
		}
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