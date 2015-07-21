(function () {
    'use strict';
    /**
     * Module Gérant la partie publique du site
     *
     * @class qaobee.public.public
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.public.publicSignup|qaobee.public.publicSignup}
     * @requires {@link qaobee.rest.public.userInfosRestAPI|qaobee.rest.public.userInfosRestAPI}
     * @requires {@link https://github.com/mllrsohn/angular-re-captcha|reCAPTCHA}
     */
    angular.module('qaobee.signin', [
        /* angular module */
        'ngRoute',
        'reCAPTCHA',
    
        /* qaobee modules */
        'qaobee.signup',  
        
        /* qaobee API REST */
        'userInfosRestAPI' 
    
    ])

        .config(function ($routeProvider) {
            $routeProvider.when('/verifyaccount/:id/:code', {
                controller: 'AccountCtrl',
                templateUrl: 'app/public/welcome.html'
            }).when('/accountko', {
                templateUrl: 'app/public/accountKo.html'
            }).when('/accountok', {
                templateUrl: 'app/public/accountOk.html'
            }).when('/recoverpasswd/:id/:code', {
                controller: 'RecoverPasswdCtrl',
                templateUrl: 'app/public/recoverpasswd.html'
            });
        })

        
        /**
         * @class qaobee.public.public.RecoverPasswdCtrl
         * @description Contrôleur de la page templates/public/recoverpasswd.html
         */
        .controller('RecoverPasswdCtrl', function ($scope, userInfosAPI, $routeParams, $location, $rootScope, $window, $filter) {
            $scope.user = {};
            // vérification de l'id et du code d'activation
            userInfosAPI.passwdCheck($routeParams.code, $routeParams.id).success(function (data) {
                if (true === data.status) {
                    $scope.show = true;
                    $scope.id = $routeParams.id;
                    $scope.user = data.user;
                } else {
                    toastr.error($filter('translate')('popup.error.passwdurl'));
                }
            });

            $scope.updatePasswd = function () {
                if ($scope.id === undefined) {
                    return;
                }
                if ($scope.passwdForm.$valid) {
                    var data = {};
                    data.code = $routeParams.code;
                    data.id = $routeParams.id;
                    data.passwd = $scope.passwd;
                    data.captcha = $scope.captcha;
                    userInfosAPI.resetPasswd(data).success(function () {
                        toastr.success($filter('translate')('popup.success.newpasswd'));
                        $location.path('/');
                    }).error(function (error) {
                        if (error) {
                            if (error.code && error.code === 'CAPTCHA_EXCEPTION') {
                                $window.Recaptcha.reload();
                                toastr.error($filter('translate')('popup.error.' + error.code));
                            } else {
                                toastr.error(error.message);
                            }
                        }
                    });
                }
            };
        })

        /**
         * @class qaobee.public.public.AccountCtrl
         * @description Contrôleur de la page de validation de l'adresse email
         */
        .controller('AccountCtrl', function ($scope, userInfosAPI, $routeParams, $location) {
            // vérification de l'id et du code d'activation
            userInfosAPI.accountCheck($routeParams.code, $routeParams.id).success(function (data) {
                if (true === data.status) {
                    $location.path('/accountok');
                } else {
                    $location.path('/accountko');
                }
            });
        })
}());