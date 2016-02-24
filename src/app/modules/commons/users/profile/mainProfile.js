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
        'qaobee.user.password',
        'qaobee.user.userProfilPwd',
        'qaobee.user.billing',
        
        'ngAutocomplete',
        'ngPasswordStrength'
    ])

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/profile', {
                controller: 'MainProfileCtrl',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/commons/users/profile/mainProfile.html'
            });
        })
        /**
         * @class qaobee.user.profile.MainProfileCtrl
         * @description Main controller of app/modules/commons/users/profile/mainProfil.html
         */
        .controller('MainProfileCtrl', function ($scope, $filter, EnvironmentConfig, $translatePartialLoader, $translate, $rootScope, $log, user, meta) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');
            
            $scope.user = user;

            $scope.$on('$destroy', function () {
                delete $scope.user;
            });
                
        });
}());