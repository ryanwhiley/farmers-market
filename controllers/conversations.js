var express = require('express'),
		router = express.Router(),
		mongoose = require('mongoose'),
		Conversation = mongoose.model('Conversation');

router.put('/getConversation',function(req,res,next){
	Conversation.findOrCreate(req.body.users, function(err,convo){
		if(err){ return next(err); }
		res.json(convo);
	})
})

module.exports = router;