var express = require('express'),
  router = express.Router();
  // goods = require('./goods');

router.use('/',require('./goods'));
router.use('/',require('./users'));
router.use('/',require('./purchases'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


module.exports = router