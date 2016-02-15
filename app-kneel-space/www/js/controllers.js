angular.module('app.controllers', [])

.controller('AppCtrl', function($rootScope, $scope, $ionicLoading, $ionicModal, $timeout, Auth) {
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
    $ionicLoading.show({
      template: 'Logging Out...',
      duration: 2000
    });
    
    _usersRef.unauth();
    window.location.reload(true);
  };
})

.controller('LoginCtrl', function($scope, $state, $ionicLoading, Auth, Message) {
  var _usersRef = new Firebase('https://intense-torch-8571.firebaseio.com/users');
  
  if(Auth.$getAuth()) {
    $state.go('app.prayerboxes');
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
    $ionicLoading.show({
      template: 'Logging In...'
    });
    
    _usersRef.authWithPassword({
      email: $scope.loginData.email,
      password: $scope.loginData.password
    }, function(error, authData) {
      if(error) {
        $ionicLoading.hide();
        
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
        $ionicLoading.hide();

        $ionicLoading.show({
          template: 'Loading Prayer Boxes...',
          duration: 2000
        });

        $state.go("app.prayerboxes");
      }
    });
  };
  
  $scope.signup = function() {
    $state.go("signup");
  };
})

.controller('SignupCtrl', function($scope, $state, $ionicHistory, $ionicLoading, Auth, Message) {
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
      $ionicLoading.show({
        template: 'Creating User...'
      });
      Auth.$createUser({
        email: $scope.loginData.email,
        password: $scope.loginData.password
      }).then(function(authData) {
        $ionicLoading.hide();
        
        $scope.message = "User created successfully. You may login now.";
        $state.go("login");
        
        Message.timedAlert('Success', $scope.message, 'short');
      }).catch(function(error) {
        $ionicLoading.hide();
        
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

.controller('AccountCtrl', function($scope, $state, $ionicHistory, $ionicLoading, $firebaseObject, Auth, Message) {
  
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
      $ionicLoading.show({
        template: 'Saving Email...'
      });
      
      Auth.$changeEmail({
        oldEmail: $scope.emailData.email,
        newEmail: $scope.emailData.new_email,
        password: $scope.emailData.password
      }).then(function() {
        $ionicLoading.hide();
        
        $scope.emailData.email = $scope.emailData.new_email;
        $scope.message = "Email changed successfully!";
        Message.timedAlert('Success', $scope.message, 'short');
      }).catch(function(error) {
        $ionicLoading.hide();
        
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
        $ionicLoading.show({
          template: 'Saving Password...'
        });
        
        Auth.$changePassword({
          email: $scope.emailData.email,
          oldPassword: $scope.passwordData.password,
          newPassword: $scope.passwordData.new_password
        }).then(function() {
          $ionicLoading.hide();
          
          $scope.passwordData = {};
          $scope.message = "Password changed successfully!";
          Message.timedAlert('Success', $scope.message, 'short');
        }).catch(function(error) {
          $ionicLoading.hide();
          
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
          
          $ionicLoading.show({
            template: 'Deleting Account...'
          });
        
          obj.$remove().then(function(ref) {
            // 3. Remove account from auth
            Auth.$removeUser({
              email: $scope.emailData.email,
              password: $scope.passwordData.password
            }).then(function() {
              $ionicLoading.hide();
              
              $scope.message = "Your account was successfully removed!";
              Message.timedAlert('Success', $scope.message, 'short');
              Auth.$unauth();
              $state.go('login');
            }).catch(function(error) {
              $ionicLoading.hide();
              
              $scope.error = error;
              Message.timedAlert('Error', $scope.error, 'long');
            });
          }, function(error) {
            $ionicLoading.hide();
            
            $scope.error = error;
            Message.timedAlert('Error', $scope.error, 'long');
          });
        }
      }
    };
    Message.confirm(options);
  };
})

.controller('PrayerBoxsCtrl', function($rootScope, $scope, $ionicModal, $ionicListDelegate, $ionicLoading, $firebaseArray, $firebaseObject, Auth, Message) {
  $scope.pinnedonly = false;
  
  var authData = Auth.$getAuth();
  var ref = new Firebase('https://intense-torch-8571.firebaseio.com/users/' + authData.uid + '/prayerboxes');
  
  var query = ref.orderByChild("title");
  $scope.prayerboxes = $firebaseArray(query);
  
  $scope.prayerBoxData = {
    title: "",
    desc: ""
  };
  
  $ionicModal.fromTemplateUrl('edit-prayerbox.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.togglePinnedOnly = function() {
    if($scope.pinnedonly) {
      $scope.pinnedonly = false;
    } else {
      $scope.pinnedonly = true;
    }
  }

  $scope.pinPrayerBox = function(box) {
    $ionicListDelegate.closeOptionButtons();
    
    if(box.pinned) {
      box.pinned = false;
    } else {
      box.pinned = true;
    }
    
    $scope.prayerboxes.$save(box).then(function(ref) {
      
    }, function(error) {
      $scope.error = error;
      Message.timedAlert('Error', $scope.error, 'long');
    });
  }
  
  $scope.newPrayerBox = function() {
    $scope.prayerBoxData = {
      title: "",
      desc: ""
    };
    
    $scope.newBox = true;
    $scope.modal.show();
  };
  
  $scope.editPrayerBox = function(box) {
    $ionicListDelegate.closeOptionButtons();
    $scope.newBox = false;
    $scope.prayerBoxData = box;
    $scope.modal.show();
  };
  
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  
  $scope.savePrayerBox = function() {
    var box = {
      title: $scope.prayerBoxData.title,
      desc: $scope.prayerBoxData.desc
    }
    
    $ionicLoading.show({
      template: 'Saving Prayer Box...'
    });
    
    if($scope.newBox) {
      $scope.prayerboxes.$add(box).then(function(ref) {
        $ionicLoading.hide();
      }, function(error) {
        $ionicLoading.hide();
        $scope.error = error;
        Message.timedAlert('Error', $scope.error, 'long');
      });
    } else {
      $scope.prayerboxes.$save($scope.prayerBoxData).then(function(ref) {
        $ionicLoading.hide();
      }, function(error) {
        $ionicLoading.hide();
        $scope.error = error;
        Message.timedAlert('Error', $scope.error, 'long');
      });
    }
    
    $scope.modal.hide();
  };
  
  $scope.deleteBox = function(box) {
    $ionicListDelegate.closeOptionButtons();
    $scope.message = null;
    $scope.error = null;
    
    // 1. Confirm
    var options = {
      title: "Delete " + box.title,
      subTitle: "Are you sure you would like to delete your " + box.title + " prayer box?",
      message: "THIS CANNOT BE UNDONE!",
      positive_label: "GOOD BYE!",
      negative_label: "NEVER MIND",
      callback: function(result) {
        if(result) {
          $ionicLoading.show({
            template: 'Deleting Prayer Box...'
          });
          
          // 2. Remove box from user's prayer boxes
          $scope.prayerboxes.$remove(box).then(function(ref) {
            $ionicLoading.hide();
            
            $scope.message = "Your prayer box was successfully removed!";
            Message.timedAlert('Success', $scope.message, 'short');
          }, function(error) {
            $ionicLoading.hide();
            
            $scope.error = error;
            Message.timedAlert('Error', $scope.error, 'long');
          });
        }
      }
    };
    Message.confirm(options);
  };
})

.controller('PrayerBoxCtrl', function($scope, $state, $stateParams, $ionicNavBarDelegate, $ionicModal, $ionicListDelegate, $ionicLoading, $timeout, $firebaseArray, $firebaseObject, Auth, Message) {
  $scope.pinnedonly = false;
  $scope.prayerboxId = $stateParams.prayerboxId;
  
  var authData = Auth.$getAuth();
  var ref = new Firebase('https://intense-torch-8571.firebaseio.com/users/' + authData.uid + '/prayerboxes/' + $scope.prayerboxId);

  $scope.prayerbox = $firebaseObject(ref);
  
  $scope.$on('$ionicView.enter', function(e) {
    $timeout(function() {
      $ionicNavBarDelegate.title($scope.prayerbox.title);
    });
  });
    
  var cardListRef = new Firebase('https://intense-torch-8571.firebaseio.com/users/' + authData.uid + '/prayerboxes/' + $scope.prayerboxId + '/cards');
  $scope.prayercards = $firebaseArray(cardListRef);
  
  $ionicModal.fromTemplateUrl('templates/edit-prayercard.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  $scope.togglePinnedOnly = function() {
    if($scope.pinnedonly) {
      $scope.pinnedonly = false;
    } else {
      $scope.pinnedonly = true;
    }
  }

  $scope.pinPrayerCard = function(card) {
    $ionicListDelegate.closeOptionButtons();
    
    if(card.pinned) {
      card.pinned = false;
    } else {
      card.pinned = true;
    }
    
    $scope.prayercards.$save(card).then(function(ref) {
      
    }, function(error) {
      $scope.error = error;
      Message.timedAlert('Error', $scope.error, 'long');
    });
  }

  $scope.newPrayerCard = function() {
    $scope.prayercard = {
      title: "",
      body: ""
    };
    
    $scope.modal.show();
  };
  
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  
  $scope.savePrayerCard = function() {
    var card = {
      title: $scope.prayercard.title,
      body: $scope.prayercard.body,
      comments: []
    }
    
    $ionicLoading.show({
      template: 'Saving Prayer Card...'
    });
    
    $scope.prayercards.$add(card).then(function(ref) {
      $ionicLoading.hide();
    }, function(error) {
      $ionicLoading.hide();
      $scope.error = error;
      Message.timedAlert('Error', $scope.error, 'long');
    });

    $scope.modal.hide();
    
    $scope.prayercard = {
      title: "",
      desc: ""
    };
  };
  
  $scope.deletePrayerCard = function(card) {
    $ionicListDelegate.closeOptionButtons();
    
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
          $ionicLoading.show({
            template: 'Deleting Prayer Card...'
          });
          
          // 2. Remove box from user's prayer boxes
          $scope.prayercards.$remove(card).then(function(ref) {
            $ionicLoading.hide();
            
            $scope.message = "Your prayer card was successfully removed!";
            Message.timedAlert('Success', $scope.message, 'short');
          }, function(error) {
            $ionicLoading.hide();
            
            $scope.error = error;
            Message.timedAlert('Error', $scope.error, 'long');
          });
        }
      }
    };
    Message.confirm(options);
  };
})

.controller('PrayerCardCtrl', function($scope, $stateParams, $ionicNavBarDelegate, $ionicModal, $ionicHistory, $ionicLoading, $timeout, $firebaseArray, $firebaseObject, Auth, Message) {
  $scope.prayerboxId = $stateParams.prayerboxId;
  $scope.prayercardId = $stateParams.prayercardId;
  
  var authData = Auth.$getAuth();
  var ref = new Firebase('https://intense-torch-8571.firebaseio.com/users/' + authData.uid + '/prayerboxes/' + $scope.prayerboxId + '/cards/' + $scope.prayercardId);

  $scope.prayercard = $firebaseObject(ref);
  
  $scope.$on('$ionicView.enter', function(e) {
    $timeout(function() {
      $ionicNavBarDelegate.title($scope.prayercard.title);
    });
  });
    
  $scope.data = {comment: ""};
  
  $ionicModal.fromTemplateUrl('templates/edit-prayercard.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  $scope.closePrayerCard = function() {
    $ionicHistory.goBack();
  }
  
  $scope.editPrayerCard = function() {
    if(!$scope.prayercard.comments) {
      $scope.prayercard.comments = [];
    }
    
    $scope.data.comment = "";
  
    $scope.modal.show();
  };
  
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  
  $scope.addComment = function() {
    if(!$scope.prayercard.comments) {
      $scope.prayercard.comments = [];
    }

    $scope.prayercard.comments.unshift({text: $scope.data.comment});
    
    $scope.data.comment = "";

    $ionicLoading.show({
      template: 'Saving Prayer Card...'
    });
    
    $scope.prayercard.$save().then(function(ref) {
      $ionicLoading.hide();
    }, function(error) {
      $ionicLoading.hide();
      $scope.error = error;
      Message.timedAlert('Error', $scope.error, 'long');
    });
  };
  
  $scope.savePrayerCard = function() {
    $ionicLoading.show({
      template: 'Saving Prayer Card...'
    });
    
    $scope.prayercard.$save().then(function(ref) {
      $ionicLoading.hide();
      
      $scope.modal.hide();
    }, function(error) {
      $ionicLoading.hide();
      
      $scope.error = error;
      Message.timedAlert('Error', $scope.error, 'long');
    });
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
          $ionicLoading.show({
            template: 'Deleting Prayer Card...'
          });
    
          // 2. Remove card from user's prayer boxes
          $scope.prayercard.$remove().then(function(ref) {
            $ionicLoading.hide();
            
            $scope.message = "Your prayer card was successfully removed!";
            Message.timedAlert('Success', $scope.message, 'short');
          }, function(error) {
            $ionicLoading.hide();
            
            $scope.error = error;
            Message.timedAlert('Error', $scope.error, 'long');
          });
        }
      }
    };
    Message.confirm(options);
  };
})

.controller('PrayerPlanCtrl', function($scope, $state, $ionicHistory, $ionicLoading, Auth, Message) {
  var authData = Auth.$getAuth();
});