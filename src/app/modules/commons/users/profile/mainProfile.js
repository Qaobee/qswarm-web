(function () {
    'use strict';
    /**
     * user profile
     *
     * @author Christophe Kervella
     * @class qaobee.user.mainProfile
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.mainProfile', [

        'qaobee.user.writeProfile',
        'qaobee.user.config',
        'qaobee.user.effectiveDefault',
        'qaobee.user.password',
        'qaobee.user.userProfilPwd',
        'qaobee.user.billing',
        'paymentRestAPI',
        'ngAutocomplete',
        'ngPasswordStrength'
    ])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/profile', {
                controller: 'MainProfileCtrl',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/commons/users/profile/mainProfile.html'
            }).when('/private/profile/pay/:index', {
                controller: 'PayProfileCtrl',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/commons/users/profile/pay.html'
            });
        })
        /**
         * @class qaobee.user.profile.MainProfileCtrl
         * @description Main controller of app/modules/commons/users/profile/mainProfil.html
         */
        .controller('MainProfileCtrl', function ($scope, $filter, EnvironmentConfig, $translatePartialLoader, $translate, $rootScope, $log, user) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');
            $scope.user = user;
            $scope.$on('$destroy', function () {
                delete $scope.user;
            });
        })
        .controller('PayProfileCtrl', function ($scope, $filter, EnvironmentConfig, $translatePartialLoader, $translate,
                                                $log, user, meta, $window, $routeParams, paymentAPI) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');
            angular.element('#payMessageModal').openModal();
            $scope.user = user;
            $scope.modalClosed = false;
            $scope.index = $routeParams.index;
            $scope.plan = $scope.user.account.listPlan[0];
            paymentAPI.getPaymentURL($scope.index).then(function (data) {
                if (!!data.data) {
                    $scope.paymentUrl = data.data;
                    angular.element('#frame').html('<iframe class="payplug-frame" height="100%" src="' + data.data.payment_url + '"></iframe>');
                } else {
                    $scope.payError = true;
                }

            });
            $scope.doTheBack = function () {
                $window.history.back();
            };

            $scope.cancel = function () {
                angular.element('#payMessageModal').closeModal();
                $scope.doTheBack();
            };

            $scope.agree = function () {
                angular.element('#payMessageModal').closeModal();
                $scope.modalClosed = true;
            };

            $scope.$on('$destroy', function () {
                delete $scope.user;
            });

        })
    ;
}());