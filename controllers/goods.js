var express = require('express'),
		router = express.Router(),
		jwt = require('express-jwt'),
		mongoose = require('mongoose'),
		Good = mongoose.model('Good');


var auth = jwt({secret: process.env.JWT_SECRECT, userProperty: 'payload'});

// get goods by type
router.get('/type/:type', function(req, res, next) {
  // res.json(req.goods);
  Good.findByTypeOrCategory(req.params.type, function(err,goods){
    if(err){ console.log(err); return next(err); }
    console.log(goods);
    res.json(goods);
  })
});

// get goods by id
router.get('/ids', function(req, res, next) {
  Good.findByIDs(req.query.good_ids, function(err,goods){
    if(err){ return next(err); }
    res.json(goods);
  })
});

// get good by id
router.get('/:good', function(req, res) {
  res.json(req.good);
});

// create new good
router.post('/', auth, function(req, res, next) {
  Good.create(req.body, req.payload._id, function(err,good){
    if(err){ console.log(err); return next(err); }
    res.json(good);
  })
});


// search goods
router.get('/search/:term', function(req,res,next){
  Good.search(req.params.term, function(err,goods){
    if(err){ return next(err); }
    res.json(goods);
  })
});

// update specific good
router.put('/update', function(req, res, next) {
  Good.update({'_id':req.body.good._id}, req.body.good ,function(err,good){
    if(err){ return console.log(err); next(err); }
    res.json(good);
  })
});

// delete good
router.delete('/:good', function(req, res, next) {
  Good.remove({'_id':req.params.good},function(err,goods){
    if(err){ return next(err); }
    res.json(goods);
  })
});

// goods param
router.param('good', function(req, res, next, id) {
  var query = Good.findById(id).populate('seller', '_id username');
  query.exec(function (err, good){
    if (err) { return next(err); }
    if (!good) { return next(new Error('can\'t find good')); }

    req.good = good;
    return next();
  });
});

// !!!!
// im not really sure if this is being used anymore because now we are finding goods by category and 
// type rather than just type.
// type param
// router.param('type', function(req, res, next, id) {
//   Good.findByType(req.params.type, function(err, goods){
//     if (err) { return next(err); }
//     if (!goods) { return next(new Error('can\'t find goods')); }

//     req.goods = goods;
//     return next();
//   })
// });

module.exports = router;