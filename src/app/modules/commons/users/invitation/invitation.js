(function () {
    'use strict';

    angular.module('qaobee.user.invitation', [
        /* qaobee modules */
        'personSRV',
        /* services */
        'locationAPI',
        /* qaobee Rest API */
        'sandboxRestAPI',
        'signupRestAPI'
    ])

        .config(function ($routeProvider) {
            $routeProvider.when('/invitation/:invitationId', {
                controller: 'InvitationCtrl',
                templateUrl: 'app/modules/commons/users/invitation/invitation.html'
            });
        })

        .controller('InvitationCtrl', function ($rootScope, $scope, $translatePartialLoader, $log,
                                            $routeParams, $window, $location, $filter,
                                            sandboxRestAPI) {
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');
        
            $scope.invitationId = $routeParams.invitationId;
            $log.debug('invitationId',$scope.invitationId);    
            
        
            /* Remove an invitation */
            $scope.getInvitation = function () {    
                sandboxRestAPI.getInvitationToSandbox($scope.invitationId).success(function (data) {
                    
                    $log.debug('invitation',data);
                });
            };
        
            $scope.getInvitation();
        
        });
    }());