/**
 * Main module - organization
 */

var organizationMod = angular.module('organizationMod', ['structureAgeCategoriesMod', 'structureTeamsMod', 'categoryTeamsMod', 'structureCfgRestAPI']);

organizationMod.config(function ($routeProvider, metaDatasProvider) {
    $routeProvider
        .when('/private/organization',
        {
            controller: 'organizationCtrl',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'templates/prive/organization/organization.html'
        }
    );

});


organizationMod.controller('organizationCtrl', function ($log, $scope, $filter, structureCfgRestAPI, user, meta) {

    /**
     * Get all age categories for the structure and all teams of the structure
     */
    $scope.meta = meta;
    structureCfgRestAPI.getCategoriesAgeStrList($scope.meta.season.code, $scope.meta.structure._id).success(function (data) {
        $scope.categories = data;
    });
    structureCfgRestAPI.getTeamsStrList($scope.meta.season.code, $scope.meta.structure._id).success(function (data) {
        $scope.teams = data;
    });
});