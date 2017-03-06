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
        .controller('ViewTeamControler', function ($log, $http, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                                     teamRestAPI, userRestAPI) {

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

            
            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function () {
                    $scope.getTeam();
                }).error(function () {
                    $log.error('MainEffectiveControler : User not Connected');
                });
            };
            /* Primary, check if user connected */
            $scope.checkUserConnected();
        });
}());
