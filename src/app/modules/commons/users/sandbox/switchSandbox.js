(function () {
    'use strict';
    /**
     * change sandbox
     *
     * @author Christophe Kervella
     * @class qaobee.commons.users.sandbox.sbSwitch
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.sbSwitch', [])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/sbSwitch', {
                controller: 'SbSwitchCtrl',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/commons/users/sandbox/switchSandbox.html'
            });
        })
        /**
         * @class qaobee.commons.users.sandbox.SbSwitchCtrl
         * @description Main controller of app/modules/commons/users/sandbox/switchSandbox.html
         */
        .controller('SbSwitchCtrl', function ($scope, $filter, EnvironmentConfig, $window, $translatePartialLoader, 
                                               userRestAPI, sandboxRestAPI, $log, meta, user) {

            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');

            $scope.listSandbox = [];
        
            /* Retrieve list sandbox */
            $scope.getListSandbox = function () {

                sandboxRestAPI.getSandboxSharingList($scope.meta.sandbox.activityId).success(function (data) {
                    $scope.listSandbox = data.members;
                    $log.debug(meta);
                });
            };

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };


            $scope.$on('$destroy', function () {
                delete $scope.listSandbox;
            });

            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function () {
                    $scope.getListSandbox();
                }).error(function () {
                    $log.error('SbSwitchCtrl : User not Connected');
                });
            };
            
            /* Primary, check if user connected */
            $scope.checkUserConnected();
        });
}());