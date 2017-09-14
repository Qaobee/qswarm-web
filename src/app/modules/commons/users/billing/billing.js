(function () {
    'use strict';
    /**
     * user profile
     *
     * @author Christophe Kervella
     * @class qaobee.user.changePwd
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.billing', ['qaobee.user.billing.pay'])

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
        .controller('BillingCtrl', function ($scope, $window, $translatePartialLoader, $location,
                                             user, $filter, qeventbus, paymentAPI, $log) {
            $translatePartialLoader.addPart('commons').addPart('user');
            qeventbus.prepForBroadcast('menuItem', 'billing');

            /**
             * return button
             */
            $scope.doTheBack = function () {
                $window.history.back();
            };

            /**
             * Pay the bill
             *
             * @param planId
             */
            $scope.pay = function (planId) {
                $log.debug('[qaobee.user.billing] - pay', planId);
                $location.path('/private/billing/pay/' + planId);
            };

            /**
             * Leave the offer
             *
             * @param planId
             */
            $scope.unsubscribe = function (planId) {
                $log.debug('[qaobee.user.billing] - unsubscribe', planId);
                $scope.inProgress = true;
                paymentAPI.unsubscribe(planId).then(function (data) {
                    $scope.inProgress = false;
                    $log.debug('[qaobee.user.billing] - unsubscribe', data);
                    $window.location.reload();
                }, function (data) {
                    $scope.inProgress = false;
                    toastr.error(data.data.message);
                });
            };

            $scope.user = user;
            $scope.user.account.listPlan.forEach(function (p) {
                $log.debug('[qaobee.user.billing] - BillingCtrl', p);
                if (p.endPeriodDate > 0) {
                    p.formatedEndTrialDate = $filter('date')(p.endPeriodDate);
                }
                p.inTrial = p.endPeriodDate > 0 && p.endPeriodDate > moment().valueOf();
            });

        });
}());