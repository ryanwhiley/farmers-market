angular.module('farmersMarket.directives', [])

.directive('tooltip', tooltip);


function tooltip(){
	return {
    restrict: 'A',
    link: function(scope, element, attrs){
      $(element).hover(function(){
        $(element).tooltip('show');
      }, function(){
        $(element).tooltip('hide');
      });
    }
  };
}
