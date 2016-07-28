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

        /* qaobee modules */
        'qaobee.user.signup.start',
        'qaobee.user.signup.end',
        'qaobee.user.pwdRenew',
        'qaobee.user.pwdUpdate',
        'qaobee.user.writeProfile',
        'qaobee.user.billing',
        'qaobee.user.billing.pay',
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
                templateUrl: 'app/modules/commons/users/mainProfile.html'
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
        });
}());