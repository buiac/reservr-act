/* main
 */

module.exports = (function(config, db) {
  'use strict';

  var express = require('express');
  var async = require('async');
  var fs = require('fs');
  var util = require('util');
  var moment = require('moment');
  var marked = require('marked');
  
  moment.locale('ro');

  var view = function(req, res, next) {

    var startDate = req.query.startDate || '';
    var endDate = req.query.endDate || '';
    
    var defaultInterval = moment().add(30, 'days');
    
    var intervals = [];
    var activeInterval = {};
    
    intervals.push({
      label: '7 zile',
      startDate: moment().format('YYYY-MM-DD'),
      endDate: moment().add(7, 'days').format('YYYY-MM-DD')
    });
    
    intervals.push({
      label: '30 de zile',
      startDate: moment().format('YYYY-MM-DD'),
      endDate: defaultInterval.format('YYYY-MM-DD')
    });
    
    intervals.push({
      label: '3 luni',
      startDate: moment().format('YYYY-MM-DD'),
      endDate: moment().add(3, 'months').format('YYYY-MM-DD')
    });
        
    var dateFilters = {
      $lte: defaultInterval,
      $gte: new Date()
    };
    
    if(startDate) {
      dateFilters.$gte = new Date(startDate);
    } else {
      startDate = moment().format('YYYY-MM-DD');
    }
    
    if(endDate) {
      dateFilters.$lte = new Date(endDate); 
    } else {
      endDate = moment(defaultInterval).format('YYYY-MM-DD');
    }
    
    intervals.some(function(interval) {
      if(interval.startDate === startDate && interval.endDate === endDate) {
        activeInterval = interval;
        return true;
      }
      return false;
    });
    
    db.events
    .find({
      date: dateFilters
    })
    .sort({
      date: 1
    })
    .exec(function (err, events) {

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
      
      res.render('index', {
        events: events,
        startDate: startDate,
        endDate: endDate,
        intervals: intervals,
        activeInterval: activeInterval,
        
        moment: moment,
        marked: marked
      });
      
    });
    

  };

  var eventView = function(req, res, next) {

    db.events
    .findOne({
      _id: req.params.eventId
    })
    .exec(function (err, ev) {

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
      
      res.render('event', {
        events: [ev],
        moment: moment,
        marked: marked
      });
      
    });
    

  };

  return {
    view: view,
    eventView: eventView
  };

});
