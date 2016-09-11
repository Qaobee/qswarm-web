(function () {
    'use strict';
    /**
     * user profile
     *
     * @author Christophe Kervella
     * @class qaobee.user.changePwd
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.pwdUpdate', [])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/profile/changePwd', {
                controller: 'PwdCtrl',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/commons/users/password/pwdUpdate.html'
            });
        })
        /**
         * @class qaobee.user.profile.PwdCtrl
         * @description Main controller of app/modules/commons/users/profile/pwd.html
         */
        .controller('PwdCtrl', function ($scope, $filter, EnvironmentConfig, $window, $translatePartialLoader, userRestAPI) {
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');


            $scope.renew = {};

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };


            $scope.$on('$destroy', function () {
                delete $scope.user;
                delete $scope.renew;
            });

            $scope.resetPasswd = function () {
                $scope.renew.id = $scope.user._id;
                $scope.renew.code = $scope.user.account.activationCode;
                $scope.renew.byPassActivationCode = true;

                userRestAPI.resetPasswd($scope.renew).success(function () {
                    $scope.resetPwdUser();
                    toastr.success($filter('translate')('profilePwdPage.form.success'));
                }).error(function (error) {
                    $window.Recaptcha.reload();
                    if (error) {
                        if (error.code && error.code === 'CAPTCHA_EXCEPTION') {
                            toastr.error($filter('translate')('popup.error.' + error.code));
                        } else {
                            toastr.error(error.message);
                        }
                        $scope.renew = {};
                    }
                });
            };

            $scope.resetPwdUser = function () {
                $scope.renew = {};
                $scope.doTheBack();
            };
        });
}());