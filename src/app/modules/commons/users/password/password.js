(function () {
    'use strict';

    angular.module('qaobee.user.password', [
        /* angular qaobee */
       
        /* qaobee modules */
        
        /* services */

        /* qaobee Rest API */
        'userRestAPI'
    ])


    .config(function ($routeProvider) {
        $routeProvider.when('/recoverpasswd/end', {
            controller: 'PasswdEndCtrl',
            templateUrl: 'app/modules/commons/users/password/passwordEnd.html'
        }).when('/recoverpasswd/error', {
            controller: 'PasswdEndCtrl',
            templateUrl: 'app/modules/commons/users/password/passwordError.html'
        }).when('/recoverpasswd/:id/:code?', {
            controller: 'PasswdCtrl',
            templateUrl: 'app/modules/commons/users/password/password.html'
        });
    })
    
    .controller('PasswdCtrl', function ($rootScope, $scope, $timeout, $translatePartialLoader, $log, $routeParams, $window, $location, $filter, userRestAPI) {
        $translatePartialLoader.addPart('user');
        $translatePartialLoader.addPart('commons');
        
        toastr.warning('PasswdCtrl');
        
        userRestAPI.passwdCheck($routeParams.id, $routeParams.code).success(function (data) {
        	 if(data === null) {
     	    	$rootScope.messageErreur = '';
                 $location.path('/recoverpasswd/error');
     	    } else if (true === data.error) {
                 $rootScope.messageErreur = data.message;
                 $location.path('/recoverpasswd/error');
             } else {
            	 
             }
        });
    
    })
    .controller('PasswdEndCtrl', function ($rootScope, $scope, $translatePartialLoader, $log) {
    	toastr.warning('PasswdErrorCtrl');
    })
    
    .controller('PasswdErrorCtrl', function ($rootScope, $scope, $location, $translatePartialLoader, $log, $filter) {
        $translatePartialLoader.addPart('user');
        
        toastr.warning('PasswdErrorCtrl');

        $scope.message = $rootScope.messageErreur;
        if (angular.isUndefined($rootScope.messageErreur) || $scope.message === null || "" === $scope.message) {
            $scope.message = $filter('translate')('errorPage.ph.noMessage');
        }
        delete $rootScope.messageErreur;

        $scope.goHome = function () {
            $location.path('/');
        };
    });

}());
