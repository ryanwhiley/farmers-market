var express = require('express'),
  router = express.Router();
  // goods = require('./goods');

router.use('/api/goods',require('./goods'));
router.use('/api/users',require('./users'));
router.use('/api/purchases',require('./purchases'));
router.use('/api/conversations',require('./conversations'));
router.use('/api/messages',require('./messages'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router
