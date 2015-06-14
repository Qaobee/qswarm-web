/**
 * Module that shows the group
 * 
 * @author Christophe Kervella / Xavier Marin
 * @class qaobee.prive.organization.group
 * @namespace qaobee.prive.organization.group
 * 
 * @copyright <b>QaoBee</b>.
 */
angular.module('groupMod', [ 'labelsAPI', 'effectiveRestAPI', 'personRestAPI', 'userMetaAPI', 'groupAPI', 'labelsAPI', 'ui.utils', 'activityCfgRestAPI' ])

.config(function($routeProvider, metaDatasProvider) {
    'use strict';
    $routeProvider.when('/private/group/:categoryAgeCode', {
        controller : 'GroupDashboardCtrl',
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/organization/effective/group/groupDashboard.html'
    });
})
/**
 * @class qaobee.prive.organization.effective.GroupCtrl
 * @description Controller of templates/prive/organization/effective/group/groupDashboard.html
 */
.controller('GroupDashboardCtrl',
function($log, $window, $scope, $route, $routeParams, $rootScope, $modal, activityCfgRestAPI, personRestAPI, effectiveRestAPI, eventbus, groupAPI, $q, $filter, $location,
        $translatePartialLoader, user, meta) {

    var lastRoute = $route.current;
    var categoryAgeCode = $routeParams.categoryAgeCode;

    $scope.user = user;
    $scope.meta = meta;
    $translatePartialLoader.addPart('effective');
    $translatePartialLoader.addPart('stats');
    $translatePartialLoader.addPart('group');

    $scope.$watch(function() {
        return $filter('translate')('group.dashboard.maintitle');
    }, function(newval) {
        eventbus.prepForBroadcast("title", newval);
    });

    // return button
    $scope.doTheBack = function() {
        $window.history.back();
    };

    // initialize variables
    $scope.groupsEmpty = true;
    $scope.category = {};
    $scope.groups = [];
    $scope.gameLevels = [];

    /* retrieve all level game */
    function getLevelGameList() {
        activityCfgRestAPI.getLevelGameList(moment().valueOf(), meta.activity.code, meta.structure.country._id).success(function(data) {
            $scope.gameLevels = data;
        });
    }

    /* Retrieve group list for one category */
    function getAllGroups(category) {
        $scope.groups = [];

        /* retrieve all active group for one category */
        groupAPI.getActiveGroupsCategory($scope.meta.structure._id, category).success(function(data) {
            data.forEach(function(a) {
                $scope.groupsEmpty = false;
                a.listMember = [];
                var listId = [];
                listId = a.members;
                var listField = new Array("_id", "name", "firstname", "avatar", "status");

                /* retrieve person information */
                personRestAPI.getListPerson(listId, listField).success(function(data) {
                    data.forEach(function(e) {
                        if (angular.isDefined(e.status.positionType)) {
                            e.positionType = $filter('translate')('stat.positionType.value.' + e.status.positionType);
                        } else {
                            e.positionType = '';
                        }
                        e.birthdate = $filter('date')(e.birthdate, 'yyyy');
                        e.age = moment().format("YYYY") - e.birthdate;
                        e.weight = e.status.weight;
                        e.height = e.status.height;

                        a.listMember.push(e);
                    });
                });

                $scope.groups.push(a);
            });
        });
    }
    
    /* retrieve the current category */
    function getCategory(categoryAgeCode) {
        activityCfgRestAPI.getCategoryAge(moment().valueOf(), meta.activity.code, meta.structure.country._id, categoryAgeCode).success(function(data) {
            $scope.category = data;
        });
    }
    
    /* call function */
    getLevelGameList();
    getCategory(categoryAgeCode);
    getAllGroups(categoryAgeCode);
});
