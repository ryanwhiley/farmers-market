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

mongoose.model('Purchase', PruchasesSchema);