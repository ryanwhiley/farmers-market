// $(".nav a").on("click", function(){
//    $(".nav").find(".active").removeClass("active");
//    $(this).parent().addClass("active");
// 	 console.log("hello");
// });

$(document).ready(function () {


  $('.dropdown-menu').mouseleave(function () {
		$(this).parents('li.dropdown.open').removeClass('open');
  });

  $('.dropdown').mouseleave(function(){
  	$(this).removeClass('open');
  	$(this).find('a').blur();
  })

});
