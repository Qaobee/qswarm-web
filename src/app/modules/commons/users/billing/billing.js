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
        .controller('BillingCtrl', function ($scope, $window, $translatePartialLoader,
                                             user, $filter,qeventbus) {
            $translatePartialLoader.addPart('commons').addPart('user');
            qeventbus.prepForBroadcast('menuItem', 'billing');

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            $scope.user =user;
            $scope.user.account.listPlan.forEach(function(p) {
                p.formatedEndTrialDate = $filter('date')(p.endPeriodDate);
                p.inTrial = p.endPeriodDate > moment().valueOf();
            });

        });
}());