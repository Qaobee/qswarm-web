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
                                             user, $filter, qeventbus, paymentAPI, EnvironmentConfig) {
            $translatePartialLoader.addPart('commons').addPart('user');
            qeventbus.prepForBroadcast('menuItem', 'billing');
            $scope.user = user;
            $scope.showInvoices = [];

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
                $location.path('/private/billing/pay/' + planId);
            };

            $scope.agree = function () {
                if (angular.isDefined($scope.planId)) {
                    $scope.inProgress = true;
                    paymentAPI.unsubscribe($scope.planId).then(function (data) {
                        $scope.inProgress = false;
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
                angular.element('#unsubscribeModal').modal({
                    dismissible: false
                });
                angular.element('#unsubscribeModal').modal('open');
            };


            $scope.paginate = function (array, page_size, page_number) {
                --page_number; // because pages logically start with 1, but technically with 0
                return array.slice(page_number * page_size, (page_number + 1) * page_size);
            };

            $scope.openReceipt = function (planId, invoiceId) {

                var dualScreenLeft = window.screenLeft || screen.left;
                var dualScreenTop = window.screenTop  || screen.top;

                var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
                var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

                var left = ((width / 2) - (800 / 2)) + dualScreenLeft;
                var top = ((height / 2) - (600 / 2)) + dualScreenTop;
               var win = $window.open('', invoiceId,
                    'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no, copyhistory=no,width=800,height=600,top=' + top + ',left=' + left);
                paymentAPI.getInvoice(planId, invoiceId).then(function(data) {
                    win.document.body.innerHTML = data.data;
                },function(err) {
                    win.document.body.innerHTML = "No data";
                });

            };


            $scope.user.account.listPlan.forEach(function (p, index) {
                $scope.showInvoices.push(false);
                paymentAPI.getInvoices(index).then(function (invoices) {
                    p.invoices = invoices.data.invoices;
                    console.log(invoices.data)
                    p.invoicePage = 1;
                    if (p.endPeriodDate > 0) {
                        p.formatedEndTrialDate = $filter('date')(p.endPeriodDate);
                    }
                    p.inTrial = p.endPeriodDate > 0 && p.endPeriodDate > moment().valueOf();
                });
            });

        });
}());