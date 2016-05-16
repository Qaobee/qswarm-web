(function () {
    'use strict';
    /**
     * user profile
     *
     * @author Christophe Kervella
     * @class qaobee.user.mainProfile
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.mainProfile', [

        'qaobee.user.writeProfile',
        'qaobee.user.config',
        'qaobee.user.effectiveDefault',
        'qaobee.user.password',
        'qaobee.user.userProfilPwd',
        'qaobee.user.billing',
        'paymentRestAPI',
        'ngAutocomplete',
        'ngPasswordStrength'
    ])

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/profile', {
                controller: 'MainProfileCtrl',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/commons/users/profile/mainProfile.html'
            }).when('/private/profile/pay/:index', {
                controller: 'PayProfileCtrl',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/commons/users/profile/pay.html'
            });
        })
        /**
         * @class qaobee.user.profile.MainProfileCtrl
         * @description Main controller of app/modules/commons/users/profile/mainProfil.html
         */
        .controller('MainProfileCtrl', function ($scope, $filter, EnvironmentConfig, $translatePartialLoader, $translate, $rootScope, $log, user) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');
            $scope.user = user;
            $scope.$on('$destroy', function () {
                delete $scope.user;
            });
        })
        .controller('PayProfileCtrl', function ($scope, $filter, EnvironmentConfig, $translatePartialLoader, $translate,
                                                $log, user, meta, $routeParams, paymentAPI) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');

            $scope.user = user;
            $scope.index = $routeParams.index;
            $scope.plan = $scope.user.account.listPlan[0];
            paymentAPI.getPaymentURL($scope.index).then(function (data) {
                if (!!data.data) {
                    $scope.paymentUrl = data.data;
                    angular.element('#frame').html('<iframe class="payplug-frame" height="100%" src="' + data.data.payment_url + '"></iframe>');
                } else {
                    $scope.payError = true;
                }

            });
            $scope.$on('$destroy', function () {
                delete $scope.user;
            });

        })
    ;
}());