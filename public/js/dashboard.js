/* reservr
 */

(function(global) {

  // init foundation
  $(document).foundation();
  
  var $datePicker = document.querySelector('.event-date');
  var $dayPicker = document.querySelector('.event-interval-day');
  var $timeStartPicker = document.querySelector('.event-interval-hour-start');
  var $timeEndPicker = document.querySelector('.event-interval-hour-end');
  
  if($datePicker) {
  
    // init rome datetime picker
    rome($datePicker, {
      weekStart: 1
    });
  
  }

  if($dayPicker) {
  
    // init rome day picker
    rome($dayPicker, {
      weekStart: 1,
      time: false
    });
  
  }

  if($timeStartPicker) {
  
    // init rome day picker
    rome($timeStartPicker, {
      weekStart: 1,
      date: false
    });
  
  }

  if($timeEndPicker) {
  
    // init rome day picker
    rome($timeEndPicker, {
      weekStart: 1,
      date: false
    });
  
  }

  // add a new date interval
  var addDay = function (e) {

    e.preventDefault();

    // the current number of already added intervals
    var index = $('.days-interval').children().length;

    // get first element in group since it's the first without 
    var $dayClone = $($('.days-interval').children()[0]).clone();

    var $clonedInputs = $dayClone.find('input');

    $clonedInputs.each(function (i, input) {
      
      
      var initialClass = $(input).attr('class');

       // remove rome data
      $(input).removeAttr('data-rome-id');

      // initialize rome
      if (initialClass.indexOf('event-interval-day') >= 0) {
        rome($dayPicker, {
          weekStart: 1,
          time: false
        });
      }


      // increment class name
      $(input).attr('class', initialClass + '-' + index);

     

      // initialize rome datepicker      



    });

    $('.days-interval').append($dayClone);
    
  };

  $('.add-day').on('click', addDay);




  
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


