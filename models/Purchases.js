var mongoose = require('mongoose');

var PruchasesSchema = new mongoose.Schema({
	good: String,
	buyer: String,
	seller: String,
	price: Number,
	quantity: Number,
	delivered: {type: Boolean, default: false},
	good_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Good' },
	created_at: { type: Date, default: Date.now }
	// buyer
	// seller
	// quantity
	// price
	// delivered
	// good
})

PruchasesSchema.statics.create = function(purchase,cb){
	var NewPurchase = new this(purchase);
	return NewPurchase.save(cb);
}

PruchasesSchema.statics.findByUser = function(user,cb){
	return this.find( { $or:[ {'seller':user}, {'buyer':user}]}).exec(cb);
}

mongoose.model('Purchase', PruchasesSchema);