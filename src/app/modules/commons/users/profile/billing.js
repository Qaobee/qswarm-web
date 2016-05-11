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

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/profile/billing', {
                controller: 'BillingCtrl',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/commons/users/profile/billing.html'
            });
        })
        /**
         * @class qaobee.user.profile.BillingCtrl
         * @description Main controller of app/modules/commons/users/profile/billing.html
         */
        .controller('BillingCtrl', function ($scope, $filter, EnvironmentConfig, $window, $translatePartialLoader, user, meta, downloadSrv) {
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
            });

            $scope.getBill = function (id, pay_id, bill_name) {
                downloadSrv.getPdf('/api/1/commons/users/profile/billpdf?plan_id=' + id + '&pay_id=' + pay_id, bill_name + '-Qaobee.pdf');
            };
        });
}());