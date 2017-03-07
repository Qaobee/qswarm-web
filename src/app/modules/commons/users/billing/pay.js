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
        .controller('PayProfileCtrl', function ($scope, paymentAPI, $routeParams, $window, $translatePartialLoader, user, $location) {
            $scope.willPay = false;
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');
            $scope.user = user;
            $scope.modalClosed = false;
            $scope.index = $routeParams.index;
            $scope.plan = $scope.user.account.listPlan[0];

            $scope.doTheBack = function () {
                $window.history.back();
            };

            $scope.cancel = function () {
                angular.element('#payMessageModal').modal('close');
                $location.path('/private/billing');
            };

            $scope.agree = function () {
                $scope.willPay = true;
                angular.element('#payMessageModal').modal('close');
                $scope.modalClosed = true;
            };

            $scope.$on('$destroy', function () {
                delete $scope.user;
            });

            angular.element(document).ready(function () {
                angular.element('#payMessageModal').modal({
                    complete: function () {
                        if (!$scope.willPay) {
                            $scope.doTheBack();
                        }
                    }
                });
                angular.element('#payMessageModal').modal('open');
                paymentAPI.getPaymentURL($scope.index).then(function (data) {
                    if (!!data.data) {
                        $scope.paymentUrl = data.data;
                        angular.element('#frame').html('<iframe class="payplug-frame" height="100%" src="' + data.data.payment_url + '"></iframe>');
                    } else {
                        $scope.payError = true;
                    }

                });
            });

        })
    ;
}());