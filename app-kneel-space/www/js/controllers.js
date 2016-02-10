angular.module('app.controllers', [])

.controller('AppCtrl', function($rootScope, $scope, $ionicModal, $timeout, Auth) {
  var _usersRef = new Firebase('https://intense-torch-8571.firebaseio.com/users');
  
  Auth.$onAuth(function(authData) {
    if(authData) {
      console.log("===Logged In===");
      $scope.authData = authData;
      
      // _usersRef.once('value', function(snapshot) {
      //   console.log("===Check for existing===");
      //   if(!snapshot.hasChild(authData.uid)) {
      //     console.log("===New User===");
          // _usersRef.child(authData.uid).child('profile').child('name').set(getName(authData));
          // _usersRef.child(authData.uid).child('profile').child('bio').set("");
      //  }
      // });
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
  
  if(Auth.$getAuth()) {
    $state.go('app.playlists');
  }
  
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
        $state.go("app.prayerlists");
      }
    });
  };
  
  $scope.signup = function() {
    $state.go("signup");
  };
})

.controller('SignupCtrl', function($scope, $state, $ionicHistory, Auth, Message) {
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

.controller('AccountCtrl', function($scope, $state, $ionicHistory, $firebaseObject, Auth, Message) {
  
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  // $scope.$on('$ionicView.enter', function(e) {
  // });
  
  var authData = Auth.$getAuth();
  var userProfileRef = new Firebase('https://intense-torch-8571.firebaseio.com/users/' + authData.uid + '/profile');

  $scope.profileData = $firebaseObject(userProfileRef);
  
  $scope.emailData = {
    new_email: authData.password.email,
    email: authData.password.email
  };
  
  $scope.passwordData = {};
  
  $scope.saveEmail = function() {
    $scope.message = null;
    $scope.error = null;
    
    // Update email address
    if($scope.emailData.email !== $scope.emailData.new_email)
    {
      Auth.$changeEmail({
        oldEmail: $scope.emailData.email,
        newEmail: $scope.emailData.new_email,
        password: $scope.emailData.password
      }).then(function() {
        $scope.emailData.email = $scope.emailData.new_email;
        $scope.message = "Email changed successfully!";
        Message.timedAlert('Success', $scope.message, 'short');
      }).catch(function(error) {
        $scope.error = error;
        Message.timedAlert('Error', $scope.error, 'short');
      });
    }
  };
  
  $scope.savePassword = function() {
    $scope.message = null;
    $scope.error = null;
    
    // Update password
    if($scope.passwordData.new_password) {
      if($scope.passwordData.new_password == $scope.passwordData.retype_password) {
        Auth.$changePassword({
          email: $scope.emailData.email,
          oldPassword: $scope.passwordData.password,
          newPassword: $scope.passwordData.new_password
        }).then(function() {
          $scope.passwordData = {};
          $scope.message = "Password changed successfully!";
          Message.timedAlert('Success', $scope.message, 'short');
        }).catch(function(error) {
          $scope.error = error;
          Message.timedAlert('Error', $scope.error, 'short');
        });
      } else {
        $scope.error = "The new passwords do not match.";
        Message.timedAlert('Error', $scope.error, 'short');
      }
    }
  };
  
  $scope.deleteAccount = function() {
    $scope.message = null;
    $scope.error = null;
    
    // 1. Confirm
    var options = {
      title: "Delete Account",
      subTitle: "Are you sure you would like to delete your account?",
      message: "THIS CANNOT BE UNDONE!",
      positive_label: "GOOD BYE!",
      negative_label: "NEVER MIND",
      callback: function(result) {
        if(result) {
          var userRef = new Firebase('https://intense-torch-8571.firebaseio.com/users/' + authData.uid);
          
          // 2. Remove user from users
          var obj = $firebaseObject(userRef);
          obj.$remove().then(function(ref) {
            // 3. Remove account from auth
            Auth.$removeUser({
              email: $scope.emailData.email,
              password: $scope.passwordData.password
            }).then(function() {
              $scope.message = "Your account was successfully removed!";
              Message.timedAlert('Success', $scope.message, 'short');
              Auth.$unauth();
              $state.go('login');
            }).catch(function(error) {
              $scope.error = error;
              Message.timedAlert('Error', $scope.error, 'long');
            });
          }, function(error) {
            $scope.error = error;
            Message.timedAlert('Error', $scope.error, 'long');
          });
        }
      }
    };
    Message.confirm(options);
  };
})

.controller('PrayerListsCtrl', function($rootScope, $scope, $ionicModal, $ionicListDelegate, $firebaseArray, $firebaseObject, Auth, Message) {
  $scope.pinnedonly = false;
  
  var authData = Auth.$getAuth();
  var ref = new Firebase('https://intense-torch-8571.firebaseio.com/users/' + authData.uid + '/prayerlists');
  
  var query = ref.orderByChild("title");
  $scope.prayerlists = $firebaseArray(query);
  
  $scope.prayerListData = {
    title: "",
    desc: ""
  };
  
  $ionicModal.fromTemplateUrl('edit-prayerlist.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.pinPrayerList = function(list) {
    $ionicListDelegate.closeOptionButtons();
    
    if(list.pinned) {
      list.pinned = false;
    } else {
      list.pinned = true;
    }
    
    $scope.prayerlists.$save(list);
  }
  
  $scope.newPrayerList = function() {
    $scope.prayerListData = {
      title: "",
      desc: ""
    };
    
    $scope.newList = true;
    $scope.modal.show();
  };
  
  $scope.editPrayerList = function(list) {
    $ionicListDelegate.closeOptionButtons();
    $scope.newList = false;
    $scope.prayerListData = list;
    $scope.modal.show();
  };
  
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  
  $scope.savePrayerList = function() {
    var list = {
      title: $scope.prayerListData.title,
      desc: $scope.prayerListData.desc
    }
    
    if($scope.newList) {
      $scope.prayerlists.$add(list);
    } else {
      $scope.prayerlists.$save($scope.prayerListData);
    }
    
    $scope.modal.hide();
  };
  
  $scope.deleteList = function(list) {
    $ionicListDelegate.closeOptionButtons();
    $scope.message = null;
    $scope.error = null;
    
    // 1. Confirm
    var options = {
      title: "Delete " + list.title,
      subTitle: "Are you sure you would like to delete your " + list.title + " prayer list?",
      message: "THIS CANNOT BE UNDONE!",
      positive_label: "GOOD BYE!",
      negative_label: "NEVER MIND",
      callback: function(result) {
        if(result) {
          // 2. Remove list from user's prayer lists
          $scope.prayerlists.$remove(list).then(function(ref) {
            $scope.message = "Your prayer list was successfully removed!";
            Message.timedAlert('Success', $scope.message, 'short');
          }, function(error) {
            $scope.error = error;
            Message.timedAlert('Error', $scope.error, 'long');
          });
        }
      }
    };
    Message.confirm(options);
  };
})

.controller('PrayerListCtrl', function($scope, $stateParams, $ionicModal, $firebaseArray, $firebaseObject, Auth, Message) {
  $scope.prayerlistId = $stateParams.prayerlistId;
  
  var authData = Auth.$getAuth();
  var ref = new Firebase('https://intense-torch-8571.firebaseio.com/users/' + authData.uid + '/prayerlists/' + $scope.prayerlistId);

  $scope.prayerlist = $firebaseObject(ref);
  
  var cardListRef = new Firebase('https://intense-torch-8571.firebaseio.com/users/' + authData.uid + '/prayerlists/' + $scope.prayerlistId + '/cards');
  $scope.prayercards = $firebaseArray(cardListRef);
  
  $scope.prayerCardData = {
    title: "",
    body: "",
    comments: []
  };
  
  $scope.data = {comment: ""};
  
  $ionicModal.fromTemplateUrl('templates/edit-prayercard.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.pinPrayerCard = function(card) {
    if(card.pinned) {
      card.pinned = false;
    } else {
      card.pinned = true;
    }
    
    $scope.prayercards.$save(card);
  }

  $scope.newPrayerCard = function() {
    $scope.prayerCardData = {
      title: "",
      body: "",
      comments: []
    };
    
    $scope.data.comment = "";
  
    $scope.newCard = true;
    $scope.modal.show();
  };
  
  $scope.editPrayerCard = function(card) {
    $scope.newCard = false;
    $scope.prayerCardData = card;
    
    if(!$scope.prayerCardData.comments) {
      $scope.prayerCardData.comments = [];
    }
    
    $scope.data.comment = "";
  
    $scope.modal.show();
  };
  
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  
  $scope.addComment = function() {
    $scope.prayerCardData.comments.unshift({text: $scope.data.comment});
    
    $scope.data.comment = "";
  };
  
  $scope.savePrayerCard = function() {
    var card = {
      title: $scope.prayerCardData.title,
      body: $scope.prayerCardData.body,
      comments: $scope.prayerCardData.comments
    }
    
    if($scope.newCard) {
      $scope.prayercards.$add(card);
    } else {
      $scope.prayercards.$save($scope.prayerCardData);
    }
    
    $scope.modal.hide();
    
    $scope.prayerCardData = {
      title: "",
      desc: "",
      comments: []
    };
    
    $scope.data.comment = "";
  };
  
  $scope.deleteCard = function(card) {
    $scope.message = null;
    $scope.error = null;
    
    // 1. Confirm
    var options = {
      title: "Delete " + card.title,
      subTitle: "Are you sure you would like to delete your " + card.title + " prayer card?",
      message: "THIS CANNOT BE UNDONE!",
      positive_label: "GOOD BYE!",
      negative_label: "NEVER MIND",
      callback: function(result) {
        if(result) {
          // 2. Remove list from user's prayer lists
          $scope.prayercards.$remove(card).then(function(ref) {
            $scope.message = "Your prayer card was successfully removed!";
            Message.timedAlert('Success', $scope.message, 'short');
          }, function(error) {
            $scope.error = error;
            Message.timedAlert('Error', $scope.error, 'long');
          });
        }
      }
    };
    Message.confirm(options);
  };
});
