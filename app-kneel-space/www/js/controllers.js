angular.module('app.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, Auth) {
  var _usersRef = new Firebase('https://intense-torch-8571.firebaseio.com/users');
  
  Auth.$onAuth(function(authData) {
    if(authData) {
      console.log("===Logged In===");
      $scope.authData = authData;
      
      _usersRef.child(authData.uid).child('provider').set(authData.provider);
      _usersRef.child(authData.uid).child('name').set(getName(authData));
      $timeout(function() {
         $scope.$apply();
      }, 500);
    } else {
      console.log("===Logged Out===");
    }
  });
  
  function getName(authData) {
    switch (authData.provider) {
      case 'google':
        return authData.google.displayName;
        
      case 'facebook':
        return authData.facebook.displayName;
      
      case 'twitter':
        return authData.twitter.displayName;
      
      case 'password':
        return authData.password.email.replace(/@.*/, '');
      
      default:
        return "J. Doe";
    }
  }
  
  $scope.logout = function() {
    _usersRef.unauth();
    window.location.reload(true);
  };
})

.controller('LoginCtrl', function($scope, $state, Auth, Message) {
  var _usersRef = new Firebase('https://intense-torch-8571.firebaseio.com/users');
  
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  // $scope.$on('$ionicView.enter', function(e) {
  // });

  // Form data for the login modal
  $scope.loginData = {};

  // Perform the login action when the user submits the login form
  $scope.passwordLogin = function() {
    _usersRef.authWithPassword({
      email: $scope.loginData.email,
      password: $scope.loginData.password
    }, function(error, authData) {
      if(error) {
        switch (error.code) {
          case 'INVALID_EMAIL':
            $scope.error = "The specified user account email is invalid.";
            Message.timedAlert('Error', $scope.error, 'short');
            break;
          
          case 'INVALID_PASSWORD':
            $scope.error = "The specified user account password is incorrect.";
            Message.timedAlert('Error', $scope.error, 'short');
            break;
          
          case 'INVALID_USER':
            $scope.error = "The specified user account does not exist.";
            Message.timedAlert('Error', $scope.error, 'short');
            break;
          
          default:
            $scope.error = "Error logging user in: " + error;
            Message.timedAlert('Error', $scope.error, 'short');
        }
      } else {
        $state.go("app.playlists");
      }
    });
  };
  
  $scope.signup = function() {
    $state.go("signup");
  };
})

.controller('SignupCtrl', function($scope, $state, $ionicPopup, $timeout, $ionicHistory, Auth, Message) {
  var _usersRef = new Firebase('https://intense-torch-8571.firebaseio.com/users');
  
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  // $scope.$on('$ionicView.enter', function(e) {
  // });

  // Form data for the login modal
  $scope.loginData = {};
  
  $scope.createUser = function() {
    $scope.message = null;
    $scope.error = null;
    
    if($scope.loginData.password == $scope.loginData.retype_password) {
      Auth.$createUser({
        email: $scope.loginData.email,
        password: $scope.loginData.password
      }).then(function(authData) {
        $scope.message = "User created successfully. You may login now.";
        $state.go("login");
        
        Message.timedAlert('Success', $scope.message, 'short');
      }).catch(function(error) {
        $scope.error = error;
        Message.timedAlert('Error', $scope.error, 'short');
      });
    } else {
      $scope.error = "The passwords do not match.";
      Message.timedAlert('Error', $scope.error, 'short');
    }
  };
  
  $scope.cancel = function() {
    $ionicHistory.goBack();
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
