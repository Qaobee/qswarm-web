(function () {
    'use strict';
    /**
     * Module add team
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.team.addTeam
     * @namespace qaobee.modules.sandbox.effective.team
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.teamRestAPI|qaobee.components.restAPI.sandbox.effective.teamRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.addTeam', [
        /* qaobee services */
        'effectifSRV',
        /* qaobee Rest API */
        'teamRestAPI'])

        .config(function ($routeProvider, metaProvider, userProvider) {

            $routeProvider.when('/private/addTeam/:adversary/:teamId', {
                controller: 'AddTeamControler',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/effective/team/writeTeam.html'
            }).when('/private/addTeam/:adversary', {
                controller: 'AddTeamControler',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/effective/team/writeTeam.html'
            });
        })

        /**
         * @class qaobee.modules.sandbox.effective.AddTeamControler
         * @description Main controller for view addTeam.html
         */
        .controller('AddTeamControler', function ($log, $http, $scope, $routeParams, $window, $translatePartialLoader,
                                                  $location, $rootScope, $q, $filter, user, meta, userRestAPI,
                                                  teamRestAPI, effectiveSrv) {

            $translatePartialLoader.addPart('commons').addPart('effective');

            $scope.adversary = $routeParams.adversary;
            $scope.teamId = $routeParams.teamId;
            $scope.user = user;
            $scope.meta = meta;
            $scope.addTeamTitle = true;
            $scope.currentEffective = {};

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            //Initialization team
            $scope.team = {
                sandboxId: $scope.meta.sandbox._id,
                effectiveId: $scope.meta.sandbox.effectiveDefault,
                adversary: $scope.adversary,
                enable: true
            };

            /* Retrieve list effective */
            $scope.getEffective = function () {
                effectiveSrv.getEffective($scope.meta.sandbox.effectiveDefault).then(function (data) {
                    $scope.currentEffective = data;
                });
            };


            /* Create a new team */
            $scope.writeTeam = function () {
                $scope.team.adversary = $scope.team.adversary === 'true';

                if ($scope.adversary) {
                    $scope.team.linkTeamId = [];
                    $scope.team.linkTeamId.push($scope.teamId);
                }

                /* add team */
                teamRestAPI.addTeam($scope.team).success(function (team) {

                    toastr.success($filter('translate')('addTeam.toastSuccess', {
                        label: team.label
                    }));

                    $scope.doTheBack();
                });
            };

            $scope.getEffective();
        });
}());
