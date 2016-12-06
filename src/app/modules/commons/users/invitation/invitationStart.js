(function () {
    'use strict';

    angular.module('qaobee.user.invitation', [
        /* qaobee modules */
        'personSRV',
        /* services */
        'locationAPI',
        /* qaobee Rest API */
        'sandboxRestAPI',
        'signupRestAPI'
    ])

        .config(function ($routeProvider) {
            $routeProvider.when('/invitation/:invitationId', {
                controller: 'InvitationCtrl',
                templateUrl: 'app/modules/commons/users/invitation/invitationStart.html'
            }).when('/invitationError', {
                controller: 'InvitationErrorCtrl',
                templateUrl: 'app/modules/commons/users/invitation/invitationError.html'
            }).when('/invitationCancel', {
                controller: 'InvitatioCancelCtrl',
                templateUrl: 'app/modules/commons/users/invitation/invitationCancel.html'
            }).when('/subscribeStart', {
                controller: 'SubscribeStartCtrl',
                templateUrl: 'app/modules/commons/users/invitation/subscribeStart.html'
            }).when('/subscribeStart', {
                controller: 'SubscribeEndCtrl',
                templateUrl: 'app/modules/commons/users/invitation/subscribeEnd.html'
            });
        })

        .controller('InvitationCtrl', function ($rootScope, $scope, $translatePartialLoader, $log,
                                            $routeParams, $window, $location, $filter,
                                            sandboxRestAPI) {
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');
        
            $scope.invitationId = $routeParams.invitationId;
            
        }).controller('InvitationErrorCtrl', function ($rootScope, $scope, $location, $translatePartialLoader, $log, $filter) {
            $translatePartialLoader.addPart('user');

            $scope.goHome = function () {
                $location.path('/');
            };
        }).controller('InvitatioCancelCtrl', function ($rootScope, $scope, $location, $translatePartialLoader, $log, $filter) {
            $translatePartialLoader.addPart('user');

            $scope.goHome = function () {
                $location.path('/');
            };
        }).controller('SubscribeStartCtrl', function ($rootScope, $scope, $location, $translatePartialLoader, $log, $filter) {
            $translatePartialLoader.addPart('user');

            $scope.goHome = function () {
                $location.path('/');
            };
        }).controller('SubscribeEndCtrl', function ($rootScope, $scope, $location, $translatePartialLoader, $log, $filter) {
            $translatePartialLoader.addPart('user');

            $scope.goHome = function () {
                $location.path('/');
            };
        });;
    }());