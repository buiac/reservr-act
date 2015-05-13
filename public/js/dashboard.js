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
  
  }

  // initialize rome for the days interval
  var initRomeInterval = function (index) {
    
    var day = $('.days-interval').children()[index];
    var inputs = $(day).find('input');

    $.each(inputs, function (i, input) {
      
      if (input.getAttribute('class').indexOf('event-interval-day') >= 0) {
 
        rome(input, {
          weekStart: 1,
          time: false
        });
        
      }

      if (input.getAttribute('class').indexOf('event-interval-hour-start') >= 0) {
 
        rome(input, {
          weekStart: 1,
          date: false
        });

      }

      if (input.getAttribute('class').indexOf('event-interval-hour-end') >= 0) {

        rome(input, {
          weekStart: 1,
          date: false
        });
        
      }

    });

  };

  // init rome for the first day interval
  initRomeInterval(0);

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
      var initialName = $(input).attr('name').substring(0, $(input).attr('name').length - 1);

       // remove rome data
      $(input).removeAttr('data-rome-id');

      // increment class/name
      $(input).attr('class', initialClass + index);
      $(input).attr('name',  initialName + index);

    });

    $('.days-interval').append($dayClone);

    // update number of days
    $('.event-days-number').val(parseInt($('.event-days-number').val()) + 1);

    initRomeInterval(index);
    
  };

  // remove day interval
  var removeDay = function (e) {

    e.preventDefault();

    $(this).parents('.day').remove();

    // update number of days
    $('.event-days-number').val(parseInt($('.event-days-number').val()) - 1);
    
    
  };



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

  var selectEventType = function (e) {
    
    var eventType = $(this).attr('id');

    if (eventType.indexOf('one-day') >= 0) {

      $('.event-multiple-days').hide();
      $('.event-one-day').show();

      // toggle 'required' attributees
      $('.event-multiple-days input').removeAttr('required');
      $('.event-one-day input').attr('required','required');

    } else if (eventType.indexOf('multiple-day') >= 0) {

      $('.event-multiple-days').show();
      $('.event-one-day').hide();

      // toggle 'required' attributees
      $('.event-multiple-days input').attr('required','required');
      $('.event-one-day input').removeAttr('required');

    }

  };

  // init event type
  if ($('.event-type').length){

    var eventType = $('.event-type input[checked]').attr('id');
    
    if (eventType.indexOf('one-day') >= 0) {

      $('.event-multiple-days').hide();
      $('.event-one-day').show();

    } else if (eventType.indexOf('multiple-day') >= 0) {

      $('.event-multiple-days').show();
      $('.event-one-day').hide();

    }

  }
  

  // Events
  $('.add-day').on('click', addDay);
  $('body').on('click', '.remove-day', removeDay);

  $('body').on('change', '.event-type input', selectEventType);

  $('#reservations-update').on('submit', submitUpdateForm);

  $('.btn-delete-image').on('click', function(e) {
    e.stopPropagation();
  });


  
})(this);


