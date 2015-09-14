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
        /* angular modules*/
        
        /* qaobee Rest API */
        'teamRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/updateTeam/:teamId', {
                controller: 'UpdateTeamControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/team/writeTeam.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.UpdateTeamControler
     * @description Main controller for view writeTeam.html
     */
        .controller('UpdateTeamControler', function ($log, $http, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, teamRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('effective');
        
        $scope.teamId = $routeParams.teamId;

        $scope.user = user;
        $scope.meta = meta;
        
        $scope.addTeamTitle = false;
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        //Initialization team
        $scope.team = {};
        
        /* get team */
        $scope.getTeam = function () {
            
            /* get team */
            teamRestAPI.getTeam($scope.teamId).success(function (team) {
                $scope.team = team;
            });
        };
        
        /* Create a new team */
        $scope.writeTeam = function () {
            
            $scope.team.label = $scope.team.label.capitalize(true);
            $scope.team.enable = $scope.team.enable==='true';
            
            /* add team */
            teamRestAPI.updateTeam($scope.team).success(function (team) {
                
                toastr.success($filter('translate')('updateTeam.toastSuccess', {
                    label: team.label
                }));

                $window.history.back();
                        
            });
        };
        
        /* call method onLoad */
        $scope.getTeam();
    })
    
    //
    ;
}());
