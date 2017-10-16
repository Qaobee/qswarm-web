(function () {
    'use strict';

    angular.module('qaobee.user.signup', [
        'qaobee.user.signup.user',
        'qaobee.user.signup.structure',
        'signupRestAPI'
    ])

        .config(function ($routeProvider) {
            $routeProvider.when('/signup', {
                controller: 'SignupCtrl',
                templateUrl: 'app/modules/commons/users/signup/signup.html'
            }).when('/signup/done', {
                controller: 'SignupDoneCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupDone.html'
            }).when('/signup/cancel', {
                controller: 'SignupCancelCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupEndCancel.html'
            }).when('/signup/error', {
                controller: 'SignupErrorCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupEndError.html'
            }).when('/signup/end/:id/:code', {
                controller: 'SignupEndCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupEndDone.html'
            });
        })

        .controller('SignupCtrl', function ($translatePartialLoader, qeventbus) {
            $translatePartialLoader.addPart('user').addPart('commons');
            qeventbus.prepForBroadcast('menuItem', 'signup');
        })

        .controller('SignupDoneCtrl', function ($rootScope, $scope, $translatePartialLoader,
                                                qeventbus, EnvironmentConfig) {
            $translatePartialLoader.addPart('user');
            qeventbus.prepForBroadcast('menuItem', 'signup');
            $scope.url = EnvironmentConfig.appMobile;
            
        })
        .controller('SignupEndCtrl', function ($rootScope, $scope, $window, $routeParams, $translatePartialLoader, $filter,
                                               $location, EnvironmentConfig, signupRestAPI, qeventbus, mobileLinks, detectUtils) {
            $translatePartialLoader.addPart('user');
            qeventbus.prepForBroadcast('menuItem', 'signup');
            // Verification user signup

            signupRestAPI.firstConnectionCheck($routeParams.id, $routeParams.code).success(function (data) {
                if (data === null) {
                    $rootScope.messageErreur = '';
                    $location.path('/signup/error');
                } else if (true === data.error) {
                    $rootScope.messageErreur = data.message;
                    $location.path('/signup/error');
                } else {
                    $rootScope.user = data;
                    $scope.signup = data;
                    $scope.signup.account.listPlan[0].activity = {};
                    $scope.signup.account.listPlan[0].activity._id = 'ACT-HAND';
                    // Déclaration du user en mode connecté
                    $window.sessionStorage.qaobeesession = data.account.token;
                    $rootScope.notLogged = false;
                    if (detectUtils.isAndroid()) {
                        $window.location.href = mobileLinks.android;
                    } else {
                        qeventbus.prepForBroadcast('login', data);
                    }
                }
            }).error(function (error) {
                if (error !== null) {
                    $rootScope.messageErreur = error.message;
                } else {
                    $rootScope.messageErreur = $filter('translate')('signupEndPage.errorPage.ph.unknown');
                }
                $location.path('/signup/error');
            });

            $scope.getLink = function () {
                if (detectUtils.isAndroid()) {
                    $window.location.href = mobileLinks.android;
                } else {
                    toastr.success($filter('translate')('endPage.text.2'));
                    $location.path('/private');
                }
            };

        })

        .controller('SignupCancelCtrl', function () {
        })

        .controller('SignupErrorCtrl', function ($rootScope, $scope, $location, $translatePartialLoader, $log,
                                                 $window, mobileLinks, detectUtils, qeventbus) {

            $translatePartialLoader.addPart('user');
            qeventbus.prepForBroadcast('menuItem', 'signup');
            $scope.message = $rootScope.messageErreur;
            if (angular.isUndefined($scope.message) || $scope.message === null || "" === $scope.message) {
                delete $scope.message;
            }
            delete $rootScope.messageErreur;
            $scope.getLink = function () {
                if (detectUtils.isAndroid()) {
                    $window.location.href = mobileLinks.android;
                } else {
                    $location.path('/private');
                }
            };
        });

}());