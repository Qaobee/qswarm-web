(function () {
    'use strict';
    /**
     * user profile
     *
     * @author Christophe Kervella
     * @class qaobee.user.changePwd
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.billing', [])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/billing', {
                controller: 'BillingCtrl',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/commons/users/billing/billing.html'
            });
        })
        /**
         * @class qaobee.user.profile.BillingCtrl
         * @description Main controller of app/modules/commons/users/profile/billing.html
         */
        .controller('BillingCtrl', function ($rootScope, $scope, EnvironmentConfig, $window, $translatePartialLoader,
                                             user, meta, userRestAPI, qeventbus) {
            $translatePartialLoader.addPart('commons').addPart('user');
            qeventbus.prepForBroadcast('menuItem', 'billing');
            $scope.renew = {};

            userRestAPI.getCurrentUser().success(function (data) {
                $rootScope.user = loadAdmin(data);
                $scope.user = $rootScope.user;
            });

            function loadAdmin(data) {
                if (angular.isDefined(data.account) && data.account.habilitations !== null) {
                    data.account.habilitations.forEach(function (a) {
                        if (a.key === 'admin_qaobee') {
                            data.isAdmin = true;
                        }
                    });
                }
                return data;
            }

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            $scope.$on('$destroy', function () {
                delete $scope.user;
            });

            $scope.getBill = function (id, pay_id) {
                return EnvironmentConfig.apiEndPoint + '/api/1/commons/users/profile/billpdf?plan_id=' + id
                    + '&pay_id=' + pay_id
                    + '&token=' + $window.sessionStorage.qaobeesession;
            };
        });
}());