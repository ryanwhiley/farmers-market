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
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default:Date.now }
})

mongoose.model('Good', GoodsSchema);