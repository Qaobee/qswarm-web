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
        .controller('SbSwitchCtrl', function ($scope, $rootScope, $filter, EnvironmentConfig, $window, $translatePartialLoader, 
                                               userRestAPI, sandboxRestAPI, $log, meta, user, qeventbus) {

            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');

            $scope.listSandbox = [];
        
            /* Retrieve list sandbox */
            $scope.getListSandbox = function () {

                sandboxRestAPI.getSandboxSharingList($scope.meta.sandbox.activityId).success(function (data) {
                    /* Select only sandbox where user is a member activated */
                    data.members.forEach(function (a) {
                        a.members.forEach(function (m) {
                            if(m.person._id ===user._id && m.status === 'activated') {
                                $scope.listSandbox.push(a);
                            }
                        });
                    });
                });
            };
        
            /* change sandbox */
            $scope.changeSandbox = function (sandboxId) {
                if (angular.isDefined($rootScope.meta)) {
                    $scope.listSandbox.forEach(function (a) {
                        if (a._id === sandboxId) {
                            $rootScope.meta.sandbox = a;
                            qeventbus.prepForBroadcast('sandboxChange', {
                                sandbox: a
                            });
                        }
                    });
                }
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