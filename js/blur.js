(function () {
  $('#swish').hide(); 
  $('#blur-overlay').removeClass('blur-in');

  $('.open-button').click(function (e) {
	  $('#swish').fadeIn(700);
      $('#blur-overlay').addClass('blur-in');
      $('#blur-overlay').removeClass('blur-out');
      e.stopPropagation();					 
  });
      $('.close-button').click(function (e) { 

      $('#swish').fadeOut(700);
      $('#blur-overlay').removeClass('blur-in');
      $('#blur-overlay').addClass('blur-out');
      e.stopPropagation();
    });
 });