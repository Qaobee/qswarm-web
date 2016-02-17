(function () {
    'use strict';
    /**
     * Created by cke on 15/02/16.
     *
     * userProfilData directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('userProfilPwd', ['userRestAPI'])

        .directive('userProfilPwd', function ($translatePartialLoader, $window, $log, $q, $filter, userRestAPI) {
            return {
                restrict: 'E',
                scope: {
                    user: "=?"
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('profile');
                    $translatePartialLoader.addPart('commons');
                    $translatePartialLoader.addPart('user');


                    $scope.renew = {};
        
                    // return button
                    $scope.doTheBack = function() {
                        $window.history.back();
                    };


                    $scope.$on('$destroy', function () {
                        delete $scope.user;
                        delete $scope.renew;
                    });

                    $scope.resetPasswd = function() {
                        $scope.renew.id = $scope.user._id;
                        $scope.renew.code = $scope.user.account.activationCode;

                        if($scope.renew.passwd !== $scope.renew.passwdConfirm) {
                            toastr.warning($filter('translate')('profile.message.passwd.different'));
                            $window.Recaptcha.reload();
                            $scope.renew = {};
                            return;
                        }
                        userRestAPI.resetPasswd($scope.renew).success(function () {
                            $window.Recaptcha.reload();
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
                    }

                    $scope.resetPwdUser = function (pwdForm) {
                        $scope.renew = {};
                    }    
                },
                templateUrl: 'app/components/directives/user/pwd/pwd.html'
            };
        });
}());