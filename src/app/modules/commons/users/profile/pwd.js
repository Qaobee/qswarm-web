(function () {
    'use strict';
    /**
     * user profile
     *
     * @author Christophe Kervella
     * @class qaobee.user.changePwd
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.userProfilPwd', [])

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/profile/changePwd', {
                controller: 'PwdCtrl',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/commons/users/profile/pwd.html'
            });
        })
        /**
         * @class qaobee.user.profile.PwdCtrl
         * @description Main controller of app/modules/commons/users/profile/pwd.html
         */
        .controller('PwdCtrl', function ($scope, $filter, EnvironmentConfig, $window, $translatePartialLoader, userRestAPI) {
            $translatePartialLoader.addPart('profile');
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

                if ($scope.renew.passwd !== $scope.renew.passwdConfirm) {
                    toastr.warning($filter('translate')('profile.message.passwd.different'));
                    $window.Recaptcha.reload();
                    $scope.renew = {};
                    return;
                }
                userRestAPI.resetPasswd($scope.renew).success(function () {
                    $scope.resetPwdUser();
                    toastr.success($filter('translate')('profile.message.updPasswd.success'));
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