(function(){
  'use strict';
  var angularWebNotifications = angular.module('webNotifications', []);

  angularWebNotifications.service("webNotifications", ['$timeout', function($timeout){
      var PERMISSIONS = {
        granted:'granted',
        denied:'denied'
      };

      var defaults = {
        options: {
          timeout: -1
        },
        title:""
      };


      var requestPermission = function(callback){
        if(window.hasOwnProperty('Notification') && window.Notification.permission !== PERMISSIONS.granted) {
          window.Notification.requestPermission(function(status){
            if(window.Notification.permission !== status) {
              window.Notification.permission = status;
            }
            if(callback){
              callback(status);
            }
          });
        }
      };

      var showNotification = function(title, options, callback){
        var notification = new window.Notification(title, options);

        if(options.timeout >= 0) {
          $timeout(function(){
            notification.close();
          }, options.timeout, false);
        }

        if(callback) {
          callback(notification);
        }
      };

      var notification = function(title, options, callback){
        if(window.hasOwnProperty('Notification')){
          if(window.Notification.permission === PERMISSIONS.granted){
            showNotification(title, options, callback);
          } else if (window.Notification.permission !== PERMISSIONS.denied) {
            requestPermission(function(){
              if(window.Notification.permission === PERMISSIONS.granted){
                showNotification(title, options, callback);
              }
            });
          }
        }
      };

      return{
        requestPermission: function(callback){
          requestPermission(callback);
        },
        setDefaultTitle: function(title){
          defaults.title = title;
        },
        setDefaults: function(defs){
          defaults.options = defs;
        },
        extendDefaults: function(defs){
          angular.extend(defaults.options, defs);
        },
        create: function(title, options, callback){
          title = title || defaults.title;
          var opts = {};
          angular.extend(opts, defaults.options, options);
          notification(title, opts, callback);
        }
      };
    }]);
}());