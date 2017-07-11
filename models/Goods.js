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
	seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
	images: Array,
	forSale: {type: Boolean, default: true},
	can_deliver: Boolean,
	delivery_fee: Number,
	delivery_time: String,
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default:Date.now }
})


// find functions
// not being used as we are using find by type or category now
GoodsSchema.statics.findByType = function(type,cb){
	return this.find({type: type}).where('quantityForSale').gt(0).sort({category: 1}).populate('seller').exec(function(err,goods){
		if(err){
			cb(err);
		}else{
			console.log(goods);
			cb(null,goods);
		}
	})
}

GoodsSchema.statics.findByTypeOrCategory = function(search,cb){
	return this.find({$or: [{type:{"$regex": search, "$options": "i"}},{category:{"$regex": search, "$options": "i"}}]}).where('quantityForSale').gt(0).sort({category: 1}).populate('seller', '_id username').exec(cb)
}

GoodsSchema.statics.findByIDs = function(good_ids,cb){
	return this.find()
			    .where('quantityForSale').gt(0)
			    .populate('seller', '_id username')
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
			  .populate('seller', 'username')
			  .limit(10)
			  .exec(cb)
}

mongoose.model('Good', GoodsSchema);