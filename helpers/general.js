var general = {};

general.consolidateMostPopularGoods = function(purchases){
	var array = [];
	for(var i = 0;i<purchases.length;i++){
		array.push(purchases[i]._id)
	}
	return array;
}

general.collectRecipientsAndBuildConversationLookup = function(user_id,conversations){
	console.log(user_id,conversations);
	var recipients = [];
  var convoLookup = {};
  for(var i = 0;i<conversations.length;i++){
    if(conversations[i].participants[0]==user_id){
      recipients.push(conversations[i].participants[1])
      convoLookup[conversations[i].participants[1]] = conversations[i]._id
    }else{
      recipients.push(conversations[i].participants[0])
      convoLookup[conversations[i].participants[0]] = conversations[i]._id
    }
  }
  return {recipients: recipients, convoLookup:convoLookup}
}

general.matchUsersToConversations = function(users,conversations){

}

module.exports = general;