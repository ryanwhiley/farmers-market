var mongoose = require('mongoose');

var ConversationSchema = new mongoose.Schema({
	participants: Array
})

ConversationSchema.statics.findOrCreate = function(users, cb){
	return this.findOne({ participants: { $all: users }})
  .exec((err, convo) => {
    if (err) return cb(err,null);
    if (convo) return cb(null,{convo: convo, found: 1});

    var conversation = new this({
      participants: users
    });

    return conversation
      .save(cb(null,{convo: conversation, found: 0}))
      .catch(cb(err,null));
  });
}

mongoose.model('Conversation', ConversationSchema);