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
        .controller('BillingCtrl', function ($scope, $window, $translatePartialLoader, $location,
                                             user, $filter, qeventbus, paymentAPI, $log) {
            $translatePartialLoader.addPart('commons').addPart('user');
            qeventbus.prepForBroadcast('menuItem', 'billing');

            /**
             * return button
             */
            $scope.doTheBack = function () {
                $location.path('/private/profile');
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

            $scope.agree = function () {
                $log.debug('[qaobee.user.billing] - agree', $scope.planId);

                if (angular.isDefined($scope.planId)) {
                    $scope.inProgress = true;
                    paymentAPI.unsubscribe($scope.planId).then(function (data) {
                        $scope.inProgress = false;
                        $log.debug('[qaobee.user.billing] - agree', data);
                        delete $scope.planId;
                        $window.location.reload();
                    }, function (data) {
                        $scope.inProgress = false;
                        toastr.error(data.data.message);
                        delete $scope.planId;
                    });
                }
            };
            /**
             * Leave the offer
             *
             * @param planId
             */
            $scope.unsubscribe = function (planId) {
                $scope.planId = planId;
                $log.debug('[qaobee.user.billing] - unsubscribe', planId);
                angular.element('#unsubscribeModal').modal({
                    dismissible: false
                });
                angular.element('#unsubscribeModal').modal('open');
            };

            $scope.user = user;
            $scope.user.account.listPlan.forEach(function (p, index) {
                $log.debug('[qaobee.user.billing] - BillingCtrl', index, p);
                paymentAPI.getInvoices(index).then(function(invoices) {
                    $log.debug('[qaobee.user.billing] - BillingCtrl - invoices', invoices);

                    p.invoices = invoices.data;
                    p.invoicePage = 1;
                    if (p.endPeriodDate > 0) {
                        p.formatedEndTrialDate = $filter('date')(p.endPeriodDate);
                    }
                    p.inTrial = p.endPeriodDate > 0 && p.endPeriodDate > moment().valueOf();
                });
            });

            $scope.paginate = function (array, page_size, page_number) {
                --page_number; // because pages logically start with 1, but technically with 0
                return array.slice(page_number * page_size, (page_number + 1) * page_size);
            };

        });
}());