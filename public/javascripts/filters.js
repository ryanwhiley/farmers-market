angular.module('farmersMarket.filters', [])

.filter('filterPurchases',filterPurchases)

function filterPurchases(){
	// p = purchases
	// d = delivery status
	// s = search term
	// b = buyer || seller
	return function(p,s,d,b){
		var filtered = [];
		for(var i = 0;i<p.length;i++){
			if(
				(p[i].good.toLowerCase().indexOf(s.toLowerCase())>=0 || p[i][b].toLowerCase().indexOf(s.toLowerCase())>=0) &&
				((d===false||d=="false") || (d==="1"&&p[i].delivered===true) || (d==="0"&&p[i].delivered===false))
			){
				filtered.push(p[i]);
			}
		}
		return filtered;
	}
}