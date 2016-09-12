(function () {
    'use strict';
    /**
     * user profile
     *
     * @author Christophe Kervella
     * @class qaobee.commons.users.sandbox.SbInviteMemberCtrl
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.inviteMember', [])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/inviteMember', {
                controller: 'SbInviteMemberCtrl',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/commons/users/sandbox/invitationMembers.html'
            });
        })
        /**
         * @class qaobee.commons.users.sandbox.SbInviteMemberCtrl
         * @description Main controller of app/modules/commons/users/sandbox/invitationMembers.html
         */
        .controller('SbInviteMemberCtrl', function ($scope, $filter, EnvironmentConfig, $window, $translatePartialLoader, 
                                                     userRestAPI, $log, meta, user) {
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