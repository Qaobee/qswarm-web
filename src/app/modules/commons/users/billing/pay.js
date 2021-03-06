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

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/billing/pay/:index', {
                controller: 'PayProfileCtrl',
                resolve: {
                    user: userProvider.$get
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
                                                $timeout, paramsRestAPI) {
            $translatePartialLoader.addPart('commons').addPart('user');
            $log.debug('[qaobee.user.billing.pay] - PayProfileCtrl', $routeParams.index);
            qeventbus.prepForBroadcast('menuItem', 'billing');

            $scope.willPay = false;
            $scope.user = user;
            $log.debug('[qaobee.user.billing.pay] -', user);
            $scope.yearly = false;
            $scope.modalClosed = false;
            $scope.index = $routeParams.index;
            $scope.plan = $scope.user.account.listPlan[$routeParams.index];
            $scope.paid = false;
            $scope.inProgress = false;
            $scope.name = $scope.user.firstname + ' ' + $scope.user.name;

            $scope.init = function () {
                if (angular.isUndefined($rootScope.params)) {
                    paramsRestAPI.getParams().success(function (data) {
                        if (angular.isDefined(data) && data !== null) {
                            $rootScope.params = data;
                            window.Stripe.setPublishableKey($rootScope.params.pay_api_key);
                        }
                    });
                } else {
                    window.Stripe.setPublishableKey($rootScope.params.pay_api_key);
                }
            };

            $timeout(function () {
                $scope.init();
            });

            /**
             * Back button
             */
            $scope.doTheBack = function () {
                $window.history.back();
            };

            $scope.updateInterval = function () {
                $scope.yearly = !$scope.yearly;
                $log.debug('[qaobee.user.billing.pay] - updateInterval', $rootScope.params.plan[$scope.plan.levelPlan], $scope.yearly);
                if ($rootScope.params) {
                    if ($scope.yearly) {
                        $scope.plan.amountPaid = $rootScope.params.plan[$scope.plan.levelPlan].price_y;
                    } else {
                        $scope.plan.amountPaid = $rootScope.params.plan[$scope.plan.levelPlan].price;
                    }
                }
                $log.debug('[qaobee.user.billing.pay] - updateInterval', $scope.plan.amountPaid);
            };

            $scope.getAmountToPay = function () {
                return $scope.plan.amountPaid;
            };
            /**
             * Pay the bill
             */
            $scope.doPay = function (response) {
                var payInfo = {
                    token: response.id,
                    user_id: $scope.user._id,
                    planId: parseInt($routeParams.index),
                    levelPlan: $scope.plan.levelPlan,
                    yearly: $scope.yearly
                };
                paymentAPI.pay(payInfo).then(function (data) {
                    $log.debug('[qaobee.user.billing.pay] - doPay', payInfo, data);
                    $scope.inProgress = false;
                    if (data.data.status) {
                        var token = $window.sessionStorage.qaobeesession;
                        if (token !== null && angular.isDefined(token)) {
                            userRestAPI.getCurrentUser().success(function (data) {
                                angular.merge($rootScope.user, data);
                                qeventbus.prepForBroadcast('login', $rootScope.user);
                                qeventbus.prepForBroadcast('refreshUser', $rootScope.user);
                                angular.element('#modalPaimentSuccess').modal({
                                    dismissible: false,
                                    complete: function () {
                                        $log.debug('[qaobee.user.billing.pay] - doPay - popup close');
                                        $timeout(function () {
                                            $location.path('/private/billing');
                                        });
                                    }
                                });
                                $scope.paid = true;
                                angular.element('#modalPaimentSuccess').modal('open');
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