(function () {
    'use strict';
    /**
     * Module dashboard team
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.team.Mainteam
     * @namespace qaobee.modules.sandbox.effective.team
     *
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.teams', [
        /* angular qaobee */
        'ngAutocomplete',
        
        /* qaobee modules */
        'qaobee.addTeam',
        'qaobee.updateTeam',
        
        /* qaobee services */
        'effectifSRV',
        
        /* qaobee Rest API */
        'effectiveRestAPI',
        'teamRestAPI',
        'userRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/teams/:effectiveId', {
                controller: 'MainTeamControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/team/mainTeam.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.team.MainTeamControler
     * @description Main controller for view mainTeam.html
     */
        .controller('MainTeamControler', function ($log, $scope, $routeParams, $translatePartialLoader, $location, $rootScope, $q, $filter, 
                                                         user, meta, effectiveSrv, teamRestAPI, userRestAPI) {

        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('commons');
        
        $scope.effectiveId = $routeParams.effectiveId;

        $scope.user = user;
        $scope.meta = meta;
        $scope.listTeamHome = [];
        
                                                                                          
        /* Retrieve list of team of effective */
        $scope.getListTeamHome = function () {
            teamRestAPI.getListTeamHome($scope.meta.sandbox._id, $scope.effectiveId, 'all').success(function (data) {
                $scope.listTeamHome = data.sortBy(function(n) {
                    return n.label; 
                });
            });
            
            effectiveSrv.getEffective($scope.user.effectiveDefault).then(function(data){
                $scope.currentEffective = data;
            });    
        };
        
        
        /* check user connected */
        $scope.checkUserConnected = function () {
            userRestAPI.getUserById(user._id).success(function (data) {
                $scope.getListTeamHome();
            }).error(function (data) {
                $log.error('MainTeamControler : User not Connected');
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();
        
        
    })
    //
    ;
}());

