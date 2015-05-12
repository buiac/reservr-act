/* dashboard
 */

module.exports = (function(config, db) {
  'use strict';

  var express = require('express');
  var request = require('superagent');
  var async = require('async');
  var fs = require('fs');
  var mkdirp = require('mkdirp');
  var util = require('util');
  var moment = require('moment');
  var marked = require('marked');

  moment.defaultFormat = 'YYYY-MM-DD LT';

  var eventEditView = function(req, res, next) {

    if (req.params.eventId) {

      db.events.findOne({
        _id: req.params.eventId
      }).exec(function (err, theEvent) {

        if(err) {
          return res.render('event-edit', {errors: err});
        }

        if (!theEvent) {
          theEvent = {};
        }

        res.render('event-edit', {
          errors: [],
          theEvent: theEvent
        });

      });

    } else {

      res.render('event-edit', {
        errors: [],
        theEvent: {
          date: moment().format()
        }
      });

    }
    
    // res.render('event-edit', {errors: []});

  };

  var view = function(req, res, next) {

    db.events.find({})
    .sort({
      date: 1
    })
    .exec(function (err, events) {

      if(err) {
        return res.render('dashboard', {
          errors: err
        });
      }

      if (!events.length) {
        events = [];
      }

      // make the active image in the stack the first
      events.forEach(function (ev) {

        var activeImage = 0;
        var img;

        // get the index of the active image
        ev.images.forEach(function (image, i) {
          
          if (image.active) {
            
            activeImage = i;

          }

        });

        // take out the active image and add it to the beggining of the array
        if (activeImage > 0) {
          
          img = ev.images.splice(activeImage, 1);
          ev.images.unshift(img[0]);

        }

      });


      
      res.render('dashboard', {
        events: events
      });

    });
  };

  var eventCreate = function(req, res, next) {

    req.checkBody('name', 'Event name should not be empty').notEmpty();
    req.checkBody('description', 'Event description should not be empty').notEmpty();
    req.checkBody('seats', 'Event seats should not be empty').notEmpty();
    req.checkBody('location', 'Event location should not be empty').notEmpty();

    var errors = req.validationErrors();
    var images = [];
    
    var name = (req.body.name) ? req.body.name.trim() : '';
    var description = (req.body.description) ? req.body.description.trim() : '';
    var eventId = (req.body._id) ? req.body._id.trim() : '';
    var seats = (req.body.seats) ? req.body.seats.trim() : '';
    var location = (req.body.location) ? req.body.location.trim() : '';
    var activeImage = parseInt(req.body.activeImage || 0);


    var theEvent = {
      name: name,
      description: description,
      _id: eventId || '',
      images: images,
      date: new Date(req.body.date),
      seats: seats,
      location: location,
      activeImage: activeImage
    };
    
    // check if there's an image
    if (!req.files.images) {
            
      // for existing events,
      // if we don't add any new images, leave the old ones alone.
      if(req.body.existingImages) {
        

        theEvent.images = JSON.parse(req.body.existingImages);

        theEvent.images.forEach(function (image, i) {
          if (i === activeImage) {
            image.active = true;
          } else {
            image.active = false;
          }
        });

      } else {

        errors = errors || [];

        errors.push({
          msg: 'Please upload an event image'
        });  
        
      }

    } else if (!req.files.images.length) {

      images.push({
        path: '/media/' + req.files.images.originalname 
      });

    } else if (req.files.images.length) {

      req.files.images.forEach(function (image, i) {

        images.push({
          path: '/media/' + image.originalname
        });

      });

    }

    if (errors) {
      
      res.render('event-edit', {
        theEvent: theEvent,
        errors: errors
      });

      return;

    }

    if (eventId) {

      db.events.update({
        '_id': eventId
      }, theEvent, function (err, num, newEvent) {

        if (err) {
          res.render('event-edit', {
            errors: err,
            theEvent: theEvent
          });
        }

        if (num > 0) {
          
          res.redirect('/dashboard');

        }


      });

    } else {

      db.events.insert(theEvent, function (err, newEvent) {

        if (err) {
          res.render('event-edit', {errors: err});
        }

        res.redirect('/dashboard');

      });

    }

  };
  
  var eventDeleteImage = function(req, res, next) {
    
    var eventId = req.params.eventId;
    var pictureIndex = req.params.pictureIndex;
    
    db.events.findOne({
      _id: eventId
    }).exec(function (err, event) {

      if(event.images && event.images.length) {
        event.images.splice(pictureIndex, 1);
      }
        
      db.events.update({
        '_id': eventId
      }, event, function (err, num, newEvent) {

        res.redirect('/dashboard/event/' + eventId);

      });


    });
    
  };

  var eventDelete = function(req, res, next) {

    var id = req.params.eventId;
    
    db.events.remove({
      _id: req.params.eventId
    },function (err, num) {

      if (err) {
        res.render('event-edit', {
          errors: err,
          theEvent: {}
        });
      }

      res.redirect('/dashboard');

    });

    // TODO delete images associated with an event

  };

  var list = function(req, res, next) {

    db.events.find({})
    // .sort({
    //   date: -1
    // })
    .exec(function (err, events) {

      if(err) {
        return res.send(err, 400);
      }

      if (!events.length) {
        events = [];
      }

    });

  };

  return {
    eventCreate: eventCreate,
    view: view,
    eventEditView : eventEditView,
    eventDeleteImage: eventDeleteImage,
    eventDelete: eventDelete
  };

});
