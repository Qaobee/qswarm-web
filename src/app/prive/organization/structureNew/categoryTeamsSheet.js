/**
 * Module that shows the category or team
 * 
 * @author Nada Vujanic-Maquin
 * @class qaobee.prive.organization.structureNew
 * @namespace qaobee.prive.organization.structureNew
 * 
 * @copyright <b>QaoBee</b>.
 */
angular.module('categoryTeamsSheetMod', [ 'labelsAPI', 'structureCfgRestAPI', 'personRestAPI', 'userMetaAPI', 'ui.utils', 'activityCfgRestAPI' ])

.config(function($routeProvider, metaDatasProvider) {
    'use strict';
    $routeProvider.when('/private/categoryTeamsSheet', {
        controller : 'CategoryTeamsSheetCtrl',
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/organization/structureNew/categoryTeamsSheet.html'
    });
})

.controller('CategoryTeamsSheetCtrl',
function($log, $window, $scope, $route, $rootScope, $modal, structureCfgRestAPI, activityCfgRestAPI, personRestAPI, seasonsAPI, eventbus, $q, $filter, $location,
        $translatePartialLoader, user, meta) {
   
    var lastRoute = $route.current;
    $scope.user = user;
    $scope.meta = meta;
    $translatePartialLoader.addPart('structureNew');

    $scope.$watch(function() {
        return $filter('translate')('categoryTeams.formAddCategory.maintitle');
    }, function(newval) {
        eventbus.prepForBroadcast("title", newval);
    });
    
    // return button
    $scope.goBack = function() {
        $window.history.back();
    };
});