(function () {
    'use strict';

    angular.module('qaobee.user.signup.user', [
        'signupRestAPI'
    ])

        .config(function ($routeProvider) {
            $routeProvider.when('/signupStartCoach', {
                controller: 'SignupUserCtrl',
                resolve: {
                    single: function () {
                        return true;
                    }
                },
                templateUrl: 'app/modules/commons/users/signup/signupUser.html'
            }).when('/signupStartTeam/:teamPlan', {
                controller: 'SignupUserCtrl',
                resolve: {
                    single: function () {
                        return false;
                    }
                },
                templateUrl: 'app/modules/commons/users/signup/signupUser.html'
            });
        })

        .controller('SignupUserCtrl', function ($rootScope, $scope, $translatePartialLoader, single, $window,$routeParams,
                                                $location, $translate, signupRestAPI, qeventbus, vcRecaptchaService) {
            $translatePartialLoader.addPart('user').addPart('commons');
            qeventbus.prepForBroadcast('menuItem', 'signup');
            $scope.single = single;
            $scope.signup = {};
            $scope.widgetId = null;
            $scope.setWidgetId = function (widgetId) {
                console.info('Created widget ID: %s', widgetId);
                if (!!vcRecaptchaService && vcRecaptchaService.reset) {
                    vcRecaptchaService.reset();
                }
                $scope.widgetId = widgetId;
            };
            $scope.cbExpiration = function () {
                console.info('Captcha expired. Resetting response object');
                vcRecaptchaService.reload($scope.widgetId);
                $scope.response = null;
            };

            $scope.cancelSignup = function () {
                delete $scope.signup;
                $location.path('');
            };

            /**
             * @name $scope.usernameTest
             * @function
             * @memberOf qaobee.directives.headerMenu
             * @description Test login and create account
             */
            $scope.usernameTest = function () {
                signupRestAPI.usernameTest($scope.signup.account.login).success(function (data) {
                    if (data.status === true) {
                        toastr.warning($translate.instant('signupStartPage.form.messageControl.nonunique'));
                        vcRecaptchaService.reload($scope.widgetId);
                    } else {
                        $scope.signup.plan = {levelPlan: single ? 'FREEMIUM' : $routeParams.teamPlan, activity: {_id: 'ACT-HAND'}};
                        $scope.signup.name = $scope.signup.name.capitalize(true);
                        $scope.signup.firstname = $scope.signup.firstname.capitalize(true);
                        if (single) {
                            signupRestAPI.registerUser($scope.signup).success(function (data2) {
                                vcRecaptchaService.reload($scope.widgetId);
                                if (data2 === null) {
                                    toastr.error($translate.instant('signupStartPage.form.messageControl.unknown'));
                                } else {
                                    delete $scope.signup;
                                    delete $scope.passwdConfirm;
                                    $rootScope.user = data2.person;
                                    $location.path('/signup/done');
                                }
                            }).error(function (error) {
                                vcRecaptchaService.reload($scope.widgetId);
                                if (error.code && error.code === 'CAPTCHA_EXCEPTION') {
                                    toastr.error($translate.instant('signupStartPage.form.messageControl.' + error.code));
                                } else {
                                    $rootScope.errMessSend = true;
                                    toastr.error(error.message);
                                }
                            });
                        } else {
                            $window.sessionStorage.signup = JSON.stringify($scope.signup);
                            $location.path('/signup/club/structure');
                        }
                    }
                });
                return false;
            };
        });
}());