(function () {
    'use strict';
    /**
     * user profile
     *
     * @author Christophe Kervella
     * @class qaobee.user.mainProfile
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.billing.pay', [

        /* qaobee modules */
        'paymentRestAPI'
    ])

        .config(function ($routeProvider, metaProvider, userProvider, paramServiceProvider) {
            $routeProvider.when('/private/billing/pay/:index', {
                controller: 'PayProfileCtrl',
                resolve: {
                    user: userProvider.$get,
                    params: paramServiceProvider.$get
                },
                templateUrl: 'app/modules/commons/users/billing/pay.html'
            });
        })
        /**
         * @class qaobee.user.billing.PayProfileCtrl
         * @description Main controller of app/modules/commons/users/billing/pay.html
         */
        .controller('PayProfileCtrl', function ($rootScope, $scope, paymentAPI, $routeParams, $window, $translate,
                                                $translatePartialLoader, qeventbus, user, $location, userRestAPI, $log,
                                                params) {

            window.Stripe.setPublishableKey(params.pay_api_key);
            $translatePartialLoader.addPart('commons').addPart('user');
            $log.debug('[qaobee.user.billing.pay] - PayProfileCtrl', $routeParams.index);
            $scope.willPay = false;
            qeventbus.prepForBroadcast('menuItem', 'billing');
            $scope.user = user;
            $scope.modalClosed = false;
            $scope.index = $routeParams.index;
            $scope.plan = $scope.user.account.listPlan[$routeParams.index];
            $scope.paid = false;
            $scope.inProgress = false;
            $scope.name = $scope.user.firstname + ' ' + $scope.user.name;

            /**
             * Back button
             */
            $scope.doTheBack = function () {
                $window.history.back();
            };

            /**
             * Pay the bill
             */
            $scope.doPay = function (response) {
                var payInfo = {
                    token: response.id,
                    user_id: $scope.user._id,
                    planId: parseInt($routeParams.index)
                };
                paymentAPI.pay(payInfo).then(function (data) {
                    $scope.inProgress = false;
                    if (data.data.status) {
                        var token = $window.sessionStorage.qaobeesession;
                        if (token !== null && angular.isDefined(token)) {
                            userRestAPI.getCurrentUser().success(function (data) {
                                angular.merge($rootScope.user, data);
                                qeventbus.prepForBroadcast('login', $rootScope.user);
                                qeventbus.prepForBroadcast('refreshUser', $rootScope.user);
                                $location.path('/private/billing');
                            });
                        } else {
                            $location.path('/');
                        }
                    } else {
                        if (!!data.data.code) {
                            var val = '';
                            if (!!data.data.decline_code && 'fraudulent' === data.data.decline_code) {
                                val = $translate.instant('billingPage.label.pay.error_code.fraudulent');
                            }
                            toastr.error($translate.instant('billingPage.label.pay.error_code.' + data.data.code, {reason: val}));
                        } else {
                            toastr.error(data.data.message);
                        }
                    }
                }, function (data) {
                    $scope.inProgress = false;
                    toastr.error(data.data.message);
                });
            };

            /**
             * Handle Stripe response
             *
             * @param status
             * @param response
             */
            $scope.handleStripe = function (status, response) {
                if ($scope.inProgress) {
                    return;
                }
                $scope.inProgress = true;
                if (response.error) {
                    $scope.paid = false;
                    console.error(response.error);
                    $scope.message = 'Error from Stripe.com';
                } else {
                    $scope.doPay(response);
                }
            };
        });
}());