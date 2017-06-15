var mongoose = require('mongoose');

var PruchasesSchema = new mongoose.Schema({
	good: String,
	buyer: String,
	seller: String,
	price: Number,
	quantity: Number,
	delivered: {type: Boolean, default: false},
	delivery: {
		selected: Boolean,
		fee: Number,
		delivery_time: Date,
		delivery_location: String
	},
	pickup: {
		selected: Boolean,
		pickup_time: Date,
		pickup_location: String
	},
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
	return this.find( { $or:[ {'seller':user}, {'buyer':user}]}).sort({created_at: -1}).exec(cb);
}

PruchasesSchema.statics.mostPopular = function(count,cb){
	count = parseInt(count)+3;
	return this.aggregate([
			{ $group: { _id: "$good_id", total: { $sum: "$quantity" } } },
			{ $sort: { total: -1 } },
			{$limit: count}
		]).exec(cb);
}

mongoose.model('Purchase', PruchasesSchema);