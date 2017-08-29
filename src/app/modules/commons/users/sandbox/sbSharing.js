(function () {
    'use strict';
    /**
     * managment sandbox's members
     *
     * @author Christophe Kervella
     * @class qaobee.commons.users.sandbox.sbSharing
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.sbSharing', ['angular.chips'])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/sbSharing', {
                controller: 'SbSharingCtrl',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/commons/users/sandbox/sbSharing.html'
            });
        })
        /**
         * @class qaobee.commons.users.sandbox.SbSharingCtrl
         * @description Main controller of app/modules/commons/users/sandbox/switchSandbox.html
         */
        .controller('SbSharingCtrl', function ($scope, $filter, EnvironmentConfig, $window, $translatePartialLoader,
                                               userRestAPI, sandboxRestAPI, meta, user) {

            $translatePartialLoader.addPart('commons').addPart('user');

            $scope.user = user;
            $scope.meta = meta;

            /*list of mail to sharing */
            $scope.sharingList = [];
            /*call back method for chip renderer*/
            $scope.render = function (val) {
                return {email: val};
            };
            /*call back method for chip delete*/
            $scope.deleteChip = function () {
                return true;
            };

            $scope.sendInvitation = function () {
                $scope.sharingList.forEach(function (a) {
                    var request = {
                        sandboxId: $scope.meta.sandbox._id,
                        role_code: 'member',
                        email: a.email
                    };
                    sandboxRestAPI.inviteMemberToSandbox(request).success(function () {
                        toastr.success($filter('translate')('sbSharingPage.messageControl.success'));
                    }).error(function () {
                        toastr.error($filter('translate')('sbSharingPage.messageControl.error'));
                    });
                });
                return false;
            };

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };
        });
}());