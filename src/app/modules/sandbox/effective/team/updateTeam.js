(function () {
    'use strict';
    /**
     * Module update team
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.team.updateTeam
     * @namespace qaobee.modules.sandbox.effective.team
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.teamRestAPI|qaobee.components.restAPI.sandbox.effective.teamRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.updateTeam', [
        /* qaobee Rest API */
        'teamRestAPI'])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/updateTeam/:teamId/:adversary', {
                controller: 'UpdateTeamControler',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/effective/team/writeTeam.html'
            });
        })

        /**
         * @class qaobee.modules.sandbox.effective.UpdateTeamControler
         * @description Main controller for view writeTeam.html
         */
        .controller('UpdateTeamControler', function ($log, $http, $scope, $routeParams, $window, $translatePartialLoader,
                                                     $location, $rootScope, $q, $filter, user, meta, teamRestAPI) {

            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('effective');

            $scope.teamId = $routeParams.teamId;
            $scope.adversary = $routeParams.adversary;

            $scope.user = user;
            $scope.meta = meta;

            $scope.addTeamTitle = false;

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            //Initialization team
            $scope.team = {};
            $scope.listTeamAdversary = {};
            $scope.listTeamAdversaryUpdate = [];

            /* get team */
            $scope.getTeam = function () {

                /* get team */
                teamRestAPI.getTeam($scope.teamId).success(function (team) {
                    $scope.team = team;
                    $scope.team.enable = $scope.team.enable ? true : false;

                    if ($scope.adversary === 'false') {
                        /* Retrieve list of adversary of effective */
                        teamRestAPI.getListTeamAdversary($scope.meta.sandbox._id, $scope.user.effectiveDefault, 'all', null).success(function (data) {
                            $scope.listTeamAdversary = data.sortBy(function (n) {
                                return n.label;
                            });

                            if ($scope.listTeamAdversary.length > 0) {
                                $scope.listTeamAdversary.forEach(function (a) {
                                    a.modified = false;
                                    if (angular.isDefined(a.linkTeamId)) {
                                        a.checked = false;
                                        var trouve = a.linkTeamId.find(function (n) {
                                            return n === team._id;
                                        });
                                        a.checked = angular.isDefined(trouve);
                                    }
                                });
                            }
                        });
                    }
                });
            };

            /* Update effective list member*/
            $scope.changed = function (item) {
                if (angular.isUndefined(item.linkTeamId)) {
                    item.linkTeamId = [];
                }
                if (item.checked) {
                    item.linkTeamId.push($scope.team._id);
                } else {
                    item.linkTeamId.remove(function (n) {
                        return n === $scope.team._id;
                    });
                }
                item.modified = true;
            };

            /* Create a new team */
            $scope.writeTeam = function () {

                /* add team */
                teamRestAPI.updateTeam($scope.team).success(function (team) {

                    if ($scope.listTeamAdversary.length > 0) {
                        $scope.listTeamAdversary.forEach(function (a) {
                            if (a.modified) {
                                teamRestAPI.updateTeam(a).success();
                            }
                        });
                    }

                    toastr.success($filter('translate')('updateTeam.toastSuccess', {
                        label: team.label
                    }));

                    $window.history.back();

                });
            };

            $scope.getTeam();
        });
}());
