(function () {
    'use strict';

    angular.module('qaobee.user.pwdRenew', [
        /* angular qaobee */

        /* qaobee modules */

        /* services */
        'reCAPTCHA',

        /* qaobee Rest API */
        'userRestAPI'
    ])


        .config(function ($routeProvider) {
            $routeProvider.when('/recoverpasswd/:id/:code?', {
                controller: 'PasswdCtrl',
                templateUrl: 'app/modules/commons/users/password/pwdRenew.html'
            });
        })

        .controller('PasswdCtrl', function ($rootScope, $scope, $timeout, $translatePartialLoader, $log, $routeParams, $window, $location, $filter, userRestAPI) {
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');

            $scope.renew = {};

            userRestAPI.passwdCheck($routeParams.code, $routeParams.id).success(function (data) {
                if (data === null) {
                    toastr.error($filter('translate')('renewPasswdPage.popup.errorUnknown'));
                    $location.path('/');
                } else if (false === data.status) {
                    toastr.error($filter('translate')('renewPasswdPage.popup.errorCode'));
                    $location.path('/');
                } else if (true === data.error) {
                    toastr.error(data.message);
                    $location.path('/');
                } else {
                    $scope.renew.id = $routeParams.id;
                    $scope.renew.code = $routeParams.code;
                }
            }).error(function (data) {
                toastr.error(data);
                $location.path('/');
            });

            $scope.renewPasswd = function () {
                if ($scope.renew.passwd !== $scope.renew.passwdConfirm) {
                    toastr.warning($filter('translate')('profilePwdPage.form.messageControl.password.different'));
                    $window.Recaptcha.reload();
                    return;
                }
                userRestAPI.resetPasswd($scope.renew).success(function () {
                    $window.Recaptcha.reload();
                    toastr.success($filter('translate')('profilePwdPage.form.success'));
                    $location.path('/');
                }).error(function (error) {
                    $window.Recaptcha.reload();
                    if (error) {
                        if (error.code && error.code === 'CAPTCHA_EXCEPTION') {
                            toastr.error($filter('translate')('signupStartPage.form.messageControl.' + error.code));
                        } else {
                            toastr.error(error.message);
                        }
                    }
                });
            };

            $scope.cancelRenew = function () {
                $location.path('/');
            };
        });

}());
