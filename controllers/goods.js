var express = require('express'),
		router = express.Router(),
		jwt = require('express-jwt'),
		mongoose = require('mongoose'),
		Good = mongoose.model('Good');


var auth = jwt({secret: process.env.JWT_SECRECT, userProperty: 'payload'});

// get goods by type
router.get('/:type', function(req, res, next) {
  res.json(req.goods);
});

// get goods by id
router.get('/goods/ids', function(req, res) {
  Good.findByIDs(req.query.good_ids, function(err,goods){
    if(err){ return next(err); }
    res.json(goods);
  })
});

// get good by id
router.get('/goods/:good', function(req, res) {
  res.json(req.good);
});

// create new good
router.post('/goods', auth, function(req, res, next) {
  Good.create(req.body, req.payload.username, function(err,good){
    if(err){ console.log(err); return next(err); }
    res.json(good);
  })
});

// search goods
router.get('/goods/search/:term', function(req,res){
  Good.search(req.params.term, function(err,goods){
    if(err){ return next(err); }
    res.json(goods);
  })
})

// goods param
router.param('good', function(req, res, next, id) {
  var query = Good.findById(id);
  query.exec(function (err, good){
    if (err) { return next(err); }
    if (!good) { return next(new Error('can\'t find good')); }

    req.good = good;
    return next();
  });
});

// type param
router.param('type', function(req, res, next, id) {
  Good.findByType(req.params.type, function(err, goods){
    if (err) { return next(err); }
    if (!goods) { return next(new Error('can\'t find goods')); }

    req.goods = goods;
    return next();
  })
});

// update specific good
router.put('/goods/update', function(req, res, next) {
  Good.update({'_id':req.body.good._id}, req.body.good ,function(err,good){
    if(err){ return console.log(err); next(err); }
    res.json(good);
  })
});

// delete good
router.delete('/goods', function(req, res, next) {
  Good.remove({'_id':req.params.good},function(err,goods){
    if(err){ return next(err); }
    res.json(goods);
  })
});

module.exports = router;