var express = require('express'),
		router = express.Router(),
		app = express(),
		server = require('http').createServer(app),
		io = require('socket.io')(server),
		mongoose = require('mongoose'),
		sendgrid = require('../helpers/sendgrid-email'),
		Message = mongoose.model('Message');

server.listen(4000);

// socket io
io.on('connection', function (socket) {
  console.log('User connected');
  socket.on('disconnect', function() {
    console.log('User disconnected');
  });
  socket.on('save-message', function (data) {
    console.log(data);
    io.emit('new-message', { message: data });
  });
});

// routes
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