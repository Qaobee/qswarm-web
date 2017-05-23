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
        .controller('PayProfileCtrl', function ($scope, paymentAPI, $routeParams, $window, $translatePartialLoader, user) {
            $scope.willPay = false;
            $translatePartialLoader.addPart('commons').addPart('user');
            $scope.user = user;
            $scope.modalClosed = false;
            $scope.index = $routeParams.index;
            $scope.plan = $scope.user.account.listPlan[$routeParams.index];
            $scope.paid = false;
            $scope.inProgress = false;
            $scope.name = $scope.user.firstname + ' ' + $scope.user.name

            $scope.doTheBack = function () {
                $window.history.back();
            };

            $scope.handleStripe = function (status, response) {
                if($scope.inProgress) {
                    return;
                }
                $scope.inProgress = true;
                if (response.error) {
                    $scope.paid = false;
                    $scope.message = "Error from Stripe.com"
                } else {
                    var payInfo = {
                        token: response.id,
                        user_id: $scope.user._id,
                        planId: parseInt($routeParams.index)
                    };
                    paymentAPI.pay(payInfo).then(function (data) {
                        $scope.inProgress = false;
                        if (data.data.status) {
                            toastr.success('Paiement ok');
                        //    $scope.paid = true;
                        } else {
                            console.log(data)
                            toastr.error(data.data.message);
                        }
                    }, function (data) {
                        $scope.inProgress = false;
                        console.error(data)
                        toastr.error(data.data.message);

                    });

                }
            };
        });
}());