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
                                               userRestAPI, $log, meta, user) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');


            $scope.renew = {};

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };


            $scope.$on('$destroy', function () {
                delete $scope.user;
                delete $scope.renew;
            });

            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function () {
                    
                }).error(function () {
                    $log.error('HomeControler : User not Connected');
                });
            };
            
            /* Primary, check if user connected */
            $scope.checkUserConnected();
        });
}());