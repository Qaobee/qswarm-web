(function () {
    'use strict';
    /**
     * Created by cke on 15/01/16.
     *
     * event card directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('pricing', ['sandboxRestAPI'])

        .directive('pricing', function ($translatePartialLoader, $timeout, $location, $document, $log, $q, $filter, sandboxRestAPI, qeventbus) {
            return {
                restrict: 'E',
                scope: {
                    invitationId: "=",
                    public: '@'
                },
                controller: function ($scope) {
                    
                    $scope.subscribeButton = false;
                    $scope.invitationButton = false;
                    $scope.invitation = {};
                                 
                    $translatePartialLoader.addPart('commons');
                    $translatePartialLoader.addPart('public');
                    
                    /* Remove an invitation */
                    $scope.getInvitation = function () {    
                        sandboxRestAPI.getInvitationToSandbox($scope.invitationId).success(function (data) {
                            $scope.invitation = data;
                            $log.debug('invitation',data);
                        });
                    };
                    
                    if($scope.public==='true'){
                        qeventbus.prepForBroadcast('menuItem', 'pricing');
                        $scope.subscribeButton = true;
                    } else {
                        $scope.invitationButton = true;
                        $scope.getInvitation();
                    }
                    
                    $scope.acceptInvitation = function () {
                        $log.debug('accept',$scope.invitationId);
                    };
                    
                    $scope.refuseInvitation = function () {
                        $log.debug('refuse',$scope.invitationId);
                        var request = {
                            invitationId: $scope.invitation._id,
                            userId: $scope.invitation.senderId,
                            answer: "refused"
                        };
                        sandboxRestAPI.confirmInvitationToSandbox(request).success(function (data) {
                            $log.debug('invitation',data);
                            $location.path('/');
                        });
                    };
                },
                templateUrl: 'app/components/directives/pricing/pricing.html'
            };
        });
}());