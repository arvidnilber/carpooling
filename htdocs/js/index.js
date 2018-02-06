 $(document).ready(function() {
      if (!readCookie('hide')) {
        $('#splash').show();
      }
      $('#close-splash').click(function() {
        $('#splash').hide();
        createCookie('hide', true, 1)
        return false;
      });
    });