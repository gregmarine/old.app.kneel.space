angular.module('app.services', [])

.factory('Auth', ['$firebaseAuth', function($firebaseAuth) {
  var ref = new Firebase('https://intense-torch-8571.firebaseio.com/');
  return $firebaseAuth(ref);
}])
