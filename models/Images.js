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
	return this.find({owner: owner}).exec(cb)
}

ImageSchema.methods.deleteImage = function(id){
	return this.remove({"_id": ObjectId(id)})
}

mongoose.model('Image', ImageSchema);