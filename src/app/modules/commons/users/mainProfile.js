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
        'qaobee.user.signup',
        'qaobee.user.pwdRenew',
        'qaobee.user.pwdUpdate',
        'qaobee.user.writeProfile',
        'qaobee.user.billing',
        'qaobee.user.billing.pay',
        'qaobee.user.sbSwitch',
        'qaobee.user.sbMemberMgnt',
        'qaobee.user.sbSharing',
        'qaobee.user.invitation',
        'paymentRestAPI',
        'ngAutocomplete',
        'ngPasswordStrength',
        'sandboxRestAPI'

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
        .controller('MainProfileCtrl', function ($scope, $translatePartialLoader, $log, user, userRestAPI) {
            $translatePartialLoader.addPart('commons').addPart('user');
            $scope.user = user;
            $scope.$on('$destroy', function () {
                delete $scope.user;
            });


            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function () {

                }).error(function () {
                    $log.error('MainProfileCtrl : User not Connected');
                });
            };

            /* Primary, check if user connected */
            $scope.checkUserConnected();
        });
}());