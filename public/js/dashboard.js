/* reservr
 */

(function(global) {

  // init foundation
  $(document).foundation();
  
  var $datePicker = document.querySelector('.event-date');
  
  if($datePicker) {
  
    // init rome datetime picker
    rome($datePicker, {
      weekStart: 1
    });
  
  };
  
  $('.btn-delete-image').on('click', function(e) {
    e.stopPropagation();
  });

  // add a radio input to the image list. trying to select a default image
  // for the event
  $('.event-images li').each(function (i, li) {

    var input = $('<input type="radio" name="activeImage" value="' + i + '" class="image-default image-' + i + '" />');
    
    // search for a selected class on the li element
    if($(li).hasClass('active-image')){

      input.attr('checked', 'true');

    }

    $(li).append(input);
  
  });

  // if the image list has no active class, select the first
  if(!$('.event-images li.active-image').length) {
    $('.event-images li:first').addClass('active-image');
    $('.event-images li:first').find('input').attr('checked', 'true');
  }

  $('.image-default').on('click', function (e) {
    e.stopPropagation();

    $('.event-images li').removeClass('active-image');
    $(this).parent().addClass('active-image');

  });

  var submitUpdateForm = function() {

    var $this = $(this);
    var email = $this.find('.reserve-email').val();
    var seats = $this.find('.reserve-seats').val();
    var eventId = $this.find('.event-id').val();
    var reservationId = $this.find('.reserve-id').val();
    
    $this.removeClass('container-reserve-form--success container-reserve-form--error');
    
    $this.addClass('container-reserve-form--loading');
    
    $.ajax('/reservations/update/' + eventId, {
      type: 'POST',
      data: {
        email: email,
        seats: seats,
        eventId: eventId,
        reservationId: reservationId
      },
      success: function(res) {
        
        $this.addClass('container-reserve-form--success');
        
      },
      error: function(err) {
        
        $this.addClass('container-reserve-form--error');
        
        // allow me to try again 
        setTimeout(function() {
          
          $this.removeClass('container-reserve-form--error');
          
        }, 5000);
        
      },
      complete: function() {
       
        $this.removeClass('container-reserve-form--loading');
        
      }
    });
    
    return false;
    
  };

  $('#reservations-update').on('submit', submitUpdateForm);



  
})(this);


