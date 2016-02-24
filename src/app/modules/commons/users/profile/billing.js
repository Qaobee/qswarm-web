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
        .controller('BillingCtrl', function ($scope, $filter, EnvironmentConfig, $window, $translatePartialLoader, $translate, $rootScope, $log, user, meta) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');


            $scope.renew = {};

            // return button
            $scope.doTheBack = function() {
                $window.history.back();
            };


            $scope.$on('$destroy', function () {
                delete $scope.user;
            });
                
        });
}());