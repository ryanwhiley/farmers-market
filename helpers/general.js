var general = {};

general.consolidateMostPopularGoods = function(purchases){
	var array = [];
	for(var i = 0;i<purchases.length;i++){
		array.push(purchases[i]._id)
	}
	return array;
}

module.exports = general;