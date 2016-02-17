(function () {
    'use strict';
    /**
     * user profile
     *
     * @author Xavier MARIN
     * @class qaobee.user.profile
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.profile', [
            'ngAutocomplete',
            'ngPasswordStrength',
        
            /** Widget*/
            'userProfilData',
            'userProfilPwd'
    ])

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/profil', {
                controller: 'ProfileCtrl',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/commons/users/profile/profil.html'
            });
        })
        /**
         * @class qaobee.user.profile.ProfileCtrl
         * @description Main controller of app/modules/commons/users/profile/profil.html
         */
        .controller('ProfileCtrl', function ($scope, $filter, EnvironmentConfig, $translatePartialLoader, $translate, $rootScope, $log, user, meta) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');
            
            $scope.user = user;

            $scope.$on('$destroy', function () {
                delete $scope.user;
            });
                
        });
}());