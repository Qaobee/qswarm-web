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
        /* angular modules*/
        
        /* qaobee Rest API */
        'teamRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/addTeam/:adversary', {
                controller: 'AddTeamControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/team/writeTeam.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.AddTeamControler
     * @description Main controller for view addTeam.html
     */
        .controller('AddTeamControler', function ($log, $http, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, teamRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('effective');
        
        $scope.adversary = $routeParams.adversary;

        $scope.user = user;
        $scope.meta = meta;
        
        $scope.addTeamTitle = true;
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        //Initialization team
        $scope.team = {
            sandboxId : $scope.meta.sandbox._id,
            effectiveId : $scope.user.effectiveDefault,
            adversary : $scope.adversary,
            enable : true
        };
        
        /* Create a new team */
        $scope.writeTeam = function () {
            
            $scope.team.label = $scope.team.label.capitalize(true);
            $scope.team.adversary = $scope.team.adversary==='true';
            $scope.team.enable = $scope.team.enable==='true';
            
            /* add team */
            teamRestAPI.addTeam($scope.team).success(function (team) {
                
                toastr.success($filter('translate')('addTeam.toastSuccess', {
                    label: team.label
                }));

                $window.history.back();
                        
            });
        };
    })
    
    //
    ;
}());
