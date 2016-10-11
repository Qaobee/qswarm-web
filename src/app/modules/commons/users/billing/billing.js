(function () {
    'use strict';
    /**
     * user profile
     *
     * @author Christophe Kervella
     * @class qaobee.user.changePwd
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.billing', ['qaobee.downloadService'])

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
        .controller('BillingCtrl', function ($rootScope, $scope, $filter, EnvironmentConfig, $window, $translatePartialLoader, user, meta, downloadSrv, userRestAPI) {
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');
            userRestAPI.getCurrentUser().success(function (data) {
                $rootScope.user = loadAdmin(data);
                $scope.user = $rootScope.user;
                console.log('back')
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
            $scope.renew = {};
            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };
            $scope.$on('$destroy', function () {
                delete $scope.user;
            });

            $scope.getBill = function (id, pay_id, bill_name) {
                downloadSrv.getPdf('/api/1/commons/users/profile/billpdf?plan_id=' + id + '&pay_id=' + pay_id, bill_name + '-Qaobee.pdf');
            };
        });
}());