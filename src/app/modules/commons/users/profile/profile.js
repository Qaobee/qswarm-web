(function () {
    'use strict';
    /**
     * user profile
     *
     * @author Xavier MARIN
     * @class qaobee.user.profile
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.profile', [
            'profileRestAPI',
            'userRestAPI',
            'structureCfgRestAPI',
            'locationAPI',
            'qaobee.eventbus',
            'ngAutocomplete',
            'ngPasswordStrength',
        
            /** Widget*/
            'userProfilData'
    ])

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/profil', {
                controller: 'ProfileCtrl',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/commons/users/profile/profil.html'
            });
        })
        /**
         * @class qaobee.user.profile.ProfileCtrl
         * @description Main controller of app/modules/commons/users/profile/profil.html
         */
        .controller('ProfileCtrl', function ($scope, $timeout, qeventbus, profileRestAPI, userRestAPI, $filter, structureCfgRestAPI, EnvironmentConfig, $translatePartialLoader, $translate, $rootScope, $location, $window, locationAPI, $log, user, meta) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');
            
            $scope.user = user;
            $scope.renew = {};
        
            // return button
            $scope.doTheBack = function() {
                $window.history.back();
            };

            
            $scope.$on('$destroy', function () {
                delete $scope.user;
                delete $scope.renew;
                //delete $scope.pdfUrl;
                //delete $scope.billPdfUrl;
                delete $scope.dateOption;
            });
            
            $scope.resetPasswd = function() {
                $scope.renew.id = user._id;
                $scope.renew.code = user.account.activationCode;

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
                
        });
}());