var mongoose = require('mongoose');

var GoodsSchema = new mongoose.Schema({
	name: String,
	description: String,
	category: String,
	type: String,
	quantityForSale: Number, //actual inventory, not related to measurements
	unitOfMeasurement: String, // lbs, ozs, pints, etc
	unitOfSale: Number, //how much 1 unit of sale is
	pricePerUnit: Number, //price per unit of sale
	seller: String,
	forSale: {type: Boolean, default: true},
	can_deliver: Boolean,
	delivery_fee: Number,
	delivery_time: String,
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default:Date.now }
})

GoodsSchema.statics.findByType = function(type,cb){
	return this.find({type: type}).where('quantityForSale').gt(0).sort({category: 1}).exec(cb)
}

GoodsSchema.statics.findByIDs = function(good_ids,cb){
	return this.find()
			    .where('quantityForSale').gt(0)
			    .where('_id').in(good_ids)
			    .exec(cb);
}

GoodsSchema.statics.create = function(good,seller,cb){
	var NewGood = new this(good);
  NewGood.seller = seller;
  return NewGood.save(cb);
}

GoodsSchema.statics.search = function(term,cb){
	return this.find({$or:[{ name: { "$regex": term, "$options": "i" } }, { type: { "$regex": term, "$options": "i" } }, { category: { "$regex": term, "$options": "i" } }]})
			  .where('quantityForSale').gt(0)
			  .select('name seller type category pricePerUnit')
			  .limit(10)
			  .exec(cb)
}

mongoose.model('Good', GoodsSchema);