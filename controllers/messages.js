var express = require('express'),
		router = express.Router(),
		mongoose = require('mongoose'),
		sendgrid = require('../helpers/sendgrid-email'),
		Message = mongoose.model('Message');

router.get('/get/:convo_id',function(req,res,next){
	Message.findByConvoId(req.params.convo_id, function(err,messages){
		if(err){return next(err)}
		res.json(messages)
	})
})

router.post('/new',function(req,res,next){
	sendgrid.sendNewMessageEmail(req.body.receiver,req.body.sender,req.body.content)
	Message.create(req.body, function(err,message){
		res.json(message);
	})
	// Message.create()
})



module.exports = router;