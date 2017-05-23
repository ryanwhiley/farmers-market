$(".nav a").on("click", function(){
   $(".nav").find(".active").removeClass("active");
   $(this).parent().addClass("active");
	 console.log("hello");
});

// $scope.currentPath = $location.path();
