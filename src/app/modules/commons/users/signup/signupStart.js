(function () {
    'use strict';

    angular.module('qaobee.user.signup.start', [
        /* qaobee modules */
        'personSRV',
        /* services */
        'locationAPI',
        /* qaobee Rest API */
        'signupRestAPI'
    ])

        .config(function ($routeProvider) {
            $routeProvider.when('/signup', {
                controller: 'SignupStartCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupStart.html'
            });
        })

        .controller('SignupStartCtrl', function ($rootScope, $scope, $translatePartialLoader, $log, $routeParams,
                                                 $location, $translate, signupRestAPI, qeventbus, vcRecaptchaService) {
            $translatePartialLoader.addPart('user').addPart('commons');
            qeventbus.prepForBroadcast('menuItem', 'signup');

            $scope.signup = {};
            $scope.widgetId = null;
            $scope.setWidgetId = function (widgetId) {
                console.info('Created widget ID: %s', widgetId);
                if(!!vcRecaptchaService && vcRecaptchaService.reset) {
                    vcRecaptchaService.reset();
                }
                $scope.widgetId = widgetId;
            };
            $scope.cbExpiration = function() {
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
                        $scope.signup.plan = {levelPlan: 'FREEMIUM', activity: {_id : 'ACT-HAND'}};
                        $scope.signup.name = $scope.signup.name.capitalize(true);
                        $scope.signup.firstname = $scope.signup.firstname.capitalize(true);

                        signupRestAPI.registerUser($scope.signup).success(function (data2) {
                            // On recharge le captcha en cas d'erreur ou pour une nouvelle inscription
                            vcRecaptchaService.reload($scope.widgetId);
                            if (data2 === null) {
                                toastr.error($translate.instant('signupStartPage.form.messageControl.unknown'));
                            } else {
                                delete $scope.signup;
                                delete $scope.passwdConfirm;
                                $rootScope.user = data2.person;
                                $location.path('/signupStartDone');
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
                    }
                });
            };
        });

}());