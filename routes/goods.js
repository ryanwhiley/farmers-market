module.exports.goodsPost = function(req, res, next){
	var good = new Good(req.body);
  good.seller = req.payload.username;
  good.save(function(err, good){
    if(err){ console.log(err); return next(err); }
    res.json(good);
  });
}