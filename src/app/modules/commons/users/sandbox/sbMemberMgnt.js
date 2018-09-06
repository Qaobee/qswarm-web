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
                                                  userRestAPI, sandboxRestAPI, $log, meta, user, $timeout) {

            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');

            $scope.user = user;
            $scope.meta = meta;

            /* Retrieve sandbox user */
            $scope.getSandbox = function () {
                sandboxRestAPI.getSandboxSharingList($scope.meta.sandbox.activityId).success(function (data) {
                    $scope.listSandbox = data.members;
                    $scope.listSandbox.forEach(function (a) {
                        if (a.owner === $scope.user._id) {
                            $scope.sandbox = a;
                        }
                    });
                });
            };

            /* Remove an invitation */
            $scope.removeInvitation = function (invitationId) {
                $log.debug('invitationId', invitationId);
                sandboxRestAPI.removeInvitationToSandbox(invitationId).success(function () {
                    $scope.getInvitationToSandboxList();
                    toastr.success($filter('translate')('sbMemberMngtPage.messageControl.memberRemove', {}));
                });
            };

            /* Revive an invitation */
            $scope.reviveInvitation = function (invitationId) {
                sandboxRestAPI.reviveInvitation(invitationId).success(function () {
                    $scope.getInvitationToSandboxList();
                    toastr.success($filter('translate')('sbMemberMngtPage.messageControl.memberRemove', {}));
                });
            };

            /* Retrieve pending invitation list */
            $scope.getInvitationToSandboxList = function () {
                sandboxRestAPI.getInvitationToSandboxList($scope.meta.sandbox._id, 'waiting').success(function (data) {
                    $scope.invitationList = data;
                });
            };

            $scope.updateMemberSandbox = function (memberId) {
                var member = null;
                var request = {
                    "sandboxId": $scope.sandbox._id,
                    "userId": memberId
                };

                if ($scope.sandbox.members.length > 0) {
                    $scope.sandbox.members.forEach(function (a) {

                        if (a.personId === memberId) {
                            member = a;
                        }
                    });
                }


                if (member.status === 'activated') {
                    sandboxRestAPI.deactivateMemberToSandbox(request).success(function (data) {
                        $scope.sandbox = data;
                        toastr.success($filter('translate')('sbMemberMngtPage.messageControl.memberRemove', {
                            firstname: member.person.firstname,
                            name: member.person.name
                        }));
                    });
                } else {
                    sandboxRestAPI.activateMemberToSandbox(request).success(function (data) {
                        $scope.sandbox = data;
                        toastr.success($filter('translate')('sbMemberMngtPage.messageControl.memberAdd', {
                            firstname: member.person.firstname,
                            name: member.person.name
                        }));
                    });
                }
            };

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            $scope.$on('$destroy', function () {
                delete $scope.user;
                delete $scope.renew;
            });

            $timeout(function () {
                userRestAPI.getUserById(user._id).success(function () {
                    $scope.getSandbox();
                    $scope.getInvitationToSandboxList();
                }).error(function () {
                    $log.error('SbMemberMgntCtrl : User not Connected');
                });
            }, 0);
        });
}());