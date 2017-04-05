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
    angular.module('qaobee.viewTeam', [
        /* qaobee Rest API */
        'teamRestAPI',
        'userRestAPI',
        'qaobee.teamStats',
        'qaobee.teamInfos'])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/viewTeam/:teamId/:adversary', {
                controller: 'ViewTeamControler',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/effective/team/viewTeam.html'
            });
        })

        /**
         * @class qaobee.modules.sandbox.effective.ViewTeamControler
         * @description Main controller for view viewTeam.html
         */
        .controller('ViewTeamControler', function ($log, $http, $scope, $routeParams, $window, $translatePartialLoader,
                                                   $location, $rootScope, $q, $filter, user, meta, teamRestAPI) {

            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('effective');
            $scope.showDetail = false;

            $scope.teamId = $routeParams.teamId;
            $scope.adversary = $routeParams.adversary;

            $scope.user = user;
            $scope.meta = meta;

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };
            /* get team */
            $scope.getTeam = function () {
                /* get team */
                teamRestAPI.getTeam($scope.teamId).success(function (team) {
                    $scope.team = team;
                    $scope.team.enable = $scope.team.enable ? true : false;
                });
            };
            $scope.getTeam();
        });
}());
