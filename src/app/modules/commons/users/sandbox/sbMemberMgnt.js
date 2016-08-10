(function () {
    'use strict';
    /**
     * managment sandbox's members
     *
     * @author Christophe Kervella
     * @class qaobee.commons.users.sandbox.sbMemberMgnt
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.sbMemberMgnt', [])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/sbMemberMgnt', {
                controller: 'SbMemberMgntCtrl',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/commons/users/sandbox/sbMemberMgnt.html'
            });
        })
        /**
         * @class qaobee.commons.users.sandbox.SbMemberMgntCtrl
         * @description Main controller of app/modules/commons/users/sandbox/switchSandbox.html
         */
        .controller('SbMemberMgntCtrl', function ($scope, $filter, EnvironmentConfig, $window, $translatePartialLoader, 
                                                  userRestAPI, sandboxRestAPI, $log, meta, user) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');

            $scope.user = user;
            $scope.meta = meta;
        
            /* Retrieve current event */
            $scope.getSandbox = function () {

                sandboxRestAPI.getSandbox($scope.meta.sandbox._id).success(function (data) {
                    $scope.sandbox = data;
                    $log.debug('sandbox',$scope.sandbox);
                });
            }
            
            $scope.updateMemberSandbox = function (memberId) {
                
                $log.debug('memberId',memberId);
                var request = {};
                sandboxRestAPI.desactivateMemberToSandbox(request).success(function (data) {
                    toastr.success($filter('translate')('sbMemberMngtToast.memberAdd', {
                        firstname: person.firstname,
                        name: person.name
                    }));                                           
                });
                
            }
            
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
                    $scope.getSandbox();
                }).error(function () {
                    $log.error('HomeControler : User not Connected');
                });
            };
        
            
            
            /* Primary, check if user connected */
            $scope.checkUserConnected();
            
        });
}());