/**
 * Module that shows the age category/staff and teams/staff
 * 
 * @author Nada Vujanic-Maquin
 * @class qaobee.prive.organization.structureNew
 * @namespace qaobee.prive.organization.structureNew
 * 
 * @copyright <b>QaoBee</b>.
 */
angular.module('categoryTeamsMod', [ 'labelsAPI', 'teamRestAPI', 'teamCfgRestAPI', 'structureCfgRestAPI', 'personRestAPI', 'userMetaAPI', 'seasonsAPI', 'ui.utils', 'activityCfgRestAPI' ])

.config(function($routeProvider, metaDatasProvider) {
    'use strict';
    $routeProvider.when('/private/categoryTeamsMod', {
        controller : 'CategoryTeamsDashboardCtrl',
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/organization/structureNew/categoryTeamsDashboard.html'
    });
})
/**
 * @class qaobee.prive.organization.structureNew.categoryTeamsCtrl
 * @description Controller of templates/prive/organization/structureNew/categoryTeamsDashboard.html
 */
.controller('CategoryTeamsDashboardCtrl',
function($log, $window, $scope, $route, $rootScope, $modal, teamCfgRestAPI, teamRestAPI, structureCfgRestAPI, activityCfgRestAPI, personRestAPI, seasonsAPI, eventbus, $q, $filter, $location,
        $translatePartialLoader, user, meta) {

    var lastRoute = $route.current;
    $scope.user = user;
    $scope.meta = meta;
    $translatePartialLoader.addPart('structureNew');

    $scope.$watch(function() {
        return $filter('translate')('categoryTeams.dashboard.maintitle');
    }, function(newval) {
        eventbus.prepForBroadcast("title", newval);
    });

    // return button
    $scope.goBack = function() {
        $window.history.back();
    };

    // initialize variables
    $scope.categories = [];
    $scope.teams = [];
    $scope.teamsView = [];
    $scope.teamsView.teamCfg = [];
    $scope.categoryStaff = [];
    $scope.teamStaff = [];
    $scope.seasons = [];
    $scope.gameLevels = [];
    
    
 /* Get list of declared seasons for the structure */
    function getStructureSeasonsList() {
        seasonsAPI.getStructureSeasonsList(meta.activity.code, $scope.meta.structure._id).success(function (data) {
            data.forEach(function(a) {
                $scope.seasons.push(a);            
            });
            var trouve = false;
            data.forEach(function(b) {
                if (b.code === meta.season.code) {                   
                        $scope.currentSeason = b;
                        trouve = true;
                    }
                });
            
            if (!trouve) {
                $scope.currentSeason = data[0];
            }
        });
    }

    getStructureSeasonsList();
    
    /* retrieve all game levels for structure */
    function getLevelGameList() {
        activityCfgRestAPI.getLevelGameList(moment().valueOf(), meta.activity.code, meta.structure.country._id).success(function(data) {
            $scope.gameLevels = data;
        });
    }

    getLevelGameList(); 
    
    /* On change value for currentSeason, refresh category panel */
    $scope.$watch('currentSeason', function(newValue, oldValue) {
        if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
            getAllCategories(newValue.code); 
        }
    });
    
    /* Retrieve categories list for one season */
    function getAllCategories(seasonCode) {
        $scope.categories = [];
        
        structureCfgRestAPI.getCategoriesAgeStrList(seasonCode, $scope.meta.structure._id).success(function(data) {
            data.forEach(function(a) {
                $scope.categories.push(a);               
            });

            var trouve = false;
            data.forEach(function(b) {                
                b.listStaffMember.forEach(function(c) {               
                    if (c.personId === $scope.user._id) {
                        $scope.currentCategory = b;                        
                        trouve = true;
                    }                                        
                });
            });

            if (!trouve) {
                $scope.currentCategory = data[0];
            }
            getCategoryStaff($scope.currentCategory);
        });
    }
    
    /* On change value for currentCategory, refresh category staff list and teams list */
    $scope.$watch('currentCategory', function(newValue, oldValue) {
        if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
            getCategoryStaff(newValue);
            getAllTeams(newValue.code, $scope.currentSeason.code);
        }
    });
    
    /* Retrieve staff list for the selected category */
    function getCategoryStaff(categoryAge) {
        //$log.debug(categoryAge.listStaffMember);
        $scope.categoryStaff = categoryAge.listStaffMember;
        $scope.categoryStaff.forEach(function(staff){
            if(staff.personId !== null) {
                getPersonById(staff); 
            }           
        });                       
    }
 
    /* Retrieve person informations */
    function getPersonById(staffMember) {
        personRestAPI.getPerson(staffMember.personId).success(function (person) {
            staffMember.person = person;
        });       
    }
    
    /* Retrieve list of teams for the given structure and age category */
    function getAllTeams(categoryAge, seasonCode) {
        $scope.teams = [];

        teamRestAPI.getTeamList($scope.meta.structure._id, categoryAge).success(function(data) {
            data.forEach(function(a) {
                $scope.teams.push(a);             
            });
            
            getTeamCfg(seasonCode);
        });    
    }
    
    /* TODO - Retrieve teams list for the selected season */
    function getTeamCfg(seasonCode){ 
        $scope.teamsView = [];
       
        $scope.teams.forEach(function(a) {
            teamCfgRestAPI.getTeamCfgList(a._id, seasonCode).success(function(teamCfgSeason){
                $log.log(teamCfgSeason[0]);
                if(angular.isDefined(teamCfgSeason[0])){
                    a.teamCfg = teamCfgSeason[0];
                    $scope.teamsView.push(a);
                }
            });
        });
    }
    
    /* TODO - Retrieve staff list for all teams */
  
});



