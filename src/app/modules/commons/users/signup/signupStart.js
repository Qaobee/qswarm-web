(function () {
    'use strict';

    angular.module('qaobee.user.signup.start', [
            /* qaobee modules */
            'personSRV',
            /* services */
            'locationAPI',
            'reCAPTCHA',
            /* qaobee Rest API */
            'activityRestAPI',
            'activityCfgRestAPI',
            'countryRestAPI',
            'structureRestAPI',
            'signupRestAPI'
        ])

        .config(function ($routeProvider) {
            $routeProvider.when('/signupStart', {
                controller: 'SignupStartCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupStart.html'
            }).when('/signupStartDone', {
                controller: 'SignupStartDoneCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupStartDone.html'
            });
        })

        .controller('SignupStartCtrl', function ($rootScope, $scope, $timeout, $translatePartialLoader, $log, $routeParams,
                                                 $window, $location, $filter, WizardHandler, activityRestAPI, activityCfgRestAPI,
                                                 countryRestAPI, structureRestAPI, signupRestAPI,
                                                 qeventbus) {
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');
            qeventbus.prepForBroadcast('menuItem', 'signup');
            /**
             * @name $qcope.cancelSignup
             * @function
             * @memberOf qaobee.directives.headerMenu
             * @description Cancel user signup
             */
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
                        toastr.warning($filter('translate')('error.signup.nonunique'));
                        $window.Recaptcha.reload();
                    } else {
                        $scope.signup.plan = {levelPlan: 'FREEMIUM'};
                        $scope.signup.name = $scope.signup.name.capitalize(true);
                        $scope.signup.firstname = $scope.signup.firstname.capitalize(true);

                        signupRestAPI.registerUser($scope.signup).success(function (data2) {
                            // On recharge le captcha en cas d'erreur ou pour une nouvelle inscription
                            $window.Recaptcha.reload();
                            if (data2 === null) {
                                toastr.error($filter('translate')('error.signup.unknown'));
                            } else {
                                delete $scope.signup;
                                delete $scope.passwdConfirm;
                                $location.path('/signupStartDone')
                            }
                        }).error(function (error) {
                            $window.Recaptcha.reload();
                            if (error.code && error.code === 'CAPTCHA_EXCEPTION') {
                                toastr.error($filter('translate')('error.signup.' + error.code));
                            } else {
                                $rootScope.errMessSend = true;
                                toastr.error(error.message);
                            }
                        });
                    }
                });
            };
            
            /**
             * @name $scope.logoff
             * @function
             * @memberOf qaobee.directives.headerMenu
             * @description Disconnection
             */
            $scope.closeSignupOk = function () {
                angular.element('#modalSignupOK').closeModal();
            };

        })

        .controller('SignupStartDoneCtrl', function ($rootScope, $scope, $log, $translatePartialLoader, $location, EnvironmentConfig) {
            $translatePartialLoader.addPart('user');
            $scope.url = EnvironmentConfig.appMobile;
            $scope.goHome = function () {
                delete($rootScope.user);
                $location.path('/');
            };
        });

}());
        
        