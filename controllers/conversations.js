var express = require('express'),
		router = express.Router(),
		general = require('../helpers/general'),
		mongoose = require('mongoose'),
		Conversation = mongoose.model('Conversation');

router.put('/getConversation',function(req,res,next){
	Conversation.findOrCreate(req.body.users, function(err,convo){
		if(err){console.log(err); return next(err); }
		res.json(convo);
	})
})

// gets list of conversations, containing user id and recipient id
router.get('/getInbox/:user_id',function(req,res,next){
	Conversation.findUserInbox(req.params.user_id, function(err,inbox){
		if(err){return err}
		res.json(general.collectRecipientsAndBuildConversationLookup(req.params.user_id,inbox));
	})
})

module.exports = router;