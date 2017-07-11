var mongoose = require('mongoose');

var ImageSchema = new mongoose.Schema({
	owner: String,
	name: String,
	stock: Boolean
})

ImageSchema.statics.create = function(image,cb){
	var newImage = new this(image);
	return newImage.save(cb);
}

ImageSchema.statics.findByOwner = function(owner,cb){
	console.log(owner);
	return this.find({owner: owner}).exec(cb)
}

mongoose.model('Image', ImageSchema);