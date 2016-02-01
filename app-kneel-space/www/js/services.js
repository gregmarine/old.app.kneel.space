angular.module('app.services', [])

.factory('Auth', ['$firebaseAuth', function($firebaseAuth) {
  var ref = new Firebase('https://intense-torch-8571.firebaseio.com/');
  return $firebaseAuth(ref);
}])

.factory('Message', ['$ionicPopup', '$timeout', function($ionicPopup, $timeout) {
  return {
    timedAlert: function(title, message, duration) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: message
      });
      
      var timeout;
      switch (duration) {
        case 'short':
          timeout = 3000;
          break;
          
        case 'long':
          timeout = 5000;
          break;
        
        default:
          timeout = 3000;
      }
    
      $timeout(function() {
        alertPopup.close(); //close the popup after 3 seconds for some reason
      }, timeout);
    }
  }
}])