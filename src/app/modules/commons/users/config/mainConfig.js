(function () {
    'use strict';
    /**
     * user config
     *
     * @author Xavier MARIN
     * @class qaobee.user.config
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.config', [])

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/config', {
                controller: 'ConfigCtrl',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/commons/users/config/mainConfig.html'
            });
        })
        /**
         * @class qaobee.user.config.ConfigCtrl
         * @description Main controller of app/modules/commons/users/config/config.html
         */
        .controller('ConfigCtrl', function ($scope, $filter, EnvironmentConfig, $translatePartialLoader, $translate, $rootScope, $log, user, meta) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');
            $scope.user = user;
            $scope.$on('$destroy', function () {
                delete $scope.user;
            });
        });
}());