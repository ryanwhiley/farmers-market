var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
	sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	content: String,
	created_at: { type: Date, default: Date.now },
	conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
})

MessageSchema.statics.findByConvoId = function(convo_id,cb){
	return this.find({conversation_id: convo_id}).sort({created_at: -1}).limit(10).exec(cb)
}

MessageSchema.statics.create = function(data,cb){
	var newMessage = new this({
		conversation_id: data.conversation_id,
		sender_id: data.sender._id,
		content: data.content
	});
  return newMessage.save(cb);
}

mongoose.model('Message', MessageSchema);