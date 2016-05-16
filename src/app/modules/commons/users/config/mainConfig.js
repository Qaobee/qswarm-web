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
        .controller('ConfigCtrl', function ($scope, $filter, EnvironmentConfig, $translatePartialLoader, $translate, $rootScope, $log, user, meta,
                                            userRestAPI, effectiveRestAPI) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('effective');
        
            $scope.user = user;
            $scope.meta = meta;
            $scope.effectives = [];
        
            /* Retrieve list effective */
            $scope.getEffectives = function () {

                effectiveRestAPI.getListEffective($scope.meta._id, $scope.currentCategory).success(function (data) {
                    $scope.effectives = data.sortBy(function (n) {
                        return n.label;
                    });

                    /* retrieve the current effective */
                    data.forEach(function (a) {
                        if (a._id === $scope.effectiveId) {
                            $scope.currentEffective = a;
                        }
                    });
                });
            };
        
            $scope.$on('$destroy', function () {
                delete $scope.user;
            });
        
            /* check user connected */
            $scope.checkUserConnected = function () {

                userRestAPI.getUserById(user._id).success(function () {
                    $scope.getEffectives();
                }).error(function () {
                    $log.error('ConfigCtrlControler : User not Connected');
                });
            };

            /* Primary, check if user connected */
            $scope.checkUserConnected();
        });
}());