/**
 * Module that shows the training's theme and subTheme
 * 
 * @author Mohamed EL MARZGIOUI
 * @class qaobee.prive.training.theme
 * @namespace qaobee.prive.training.theme
 * 
 * @copyright <b>QaoBee</b>.
 */
angular.module(
        'themeMod',
        [ 'labelsAPI', 'structureCfgRestAPI', 'summarysheet', 'effectiveRestAPI', 'ngTable', 'ngTableExport', 'statWidget', 'userMetaAPI', 'staffListWidget', 'planingSessionWidget',
                'unavailableEffectiveWidget', 'palmaresEffectiveWidget', 'themeService', 'profileRestAPI', 'groupAPI', 'labelsAPI', 'statAPI', 'effectiveSearch', 'themeRestAPI', 'locationAPI',
                'ui.utils' ]).config(function($routeProvider, metaDatasProvider) {
    'use strict';
    $routeProvider.when('/private/training/theme/add', {
        controller : 'AddThemeCtrl',
        reloadOnSearch : false,
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },

        templateUrl : 'templates/prive/training/theme/addTheme.html'
    }).when('/private/training/theme/edit/:idTheme', {
        controller : 'EditThemeCtrl',
        reloadOnSearch : false,
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },

        templateUrl : 'templates/prive/training/theme/editTheme.html'
    });
})

.controller(
        'AddThemeCtrl',
        function($log, $route, $routeParams, $scope, $rootScope, $timeout, $modal, structureCfgRestAPI, themeRestAPI, eventbus, groupAPI, effectiveRestAPI, statAPI, profileRestAPI, $q, ngTableParams,
                $filter, $location, $translatePartialLoader, $window, themeService, user, meta) {
            $translatePartialLoader.addPart('training');

            $scope.theme = {};
            $scope.theme.subThemesList = [];
            $scope.themes = [];
            $scope.themeLabels = [];
            $scope.subThemeLabels = [];
            $scope.theme.author = {
                _id : user._id,
                name : user.name,
                firstname : user.firstname,
                avatar : user.avatar,
                contact : user.contact
            };
            $scope.theme.activityId = meta.activity.code;
            $scope.theme.structureId = meta.structure._id;
            $scope.exist = {};
            $scope.exist.value="hidden";
            function getThemeList(activityId) {
                themeRestAPI.getListTheme(activityId).success(function(data) {

                    $scope.themes = data;
                    for (var i = 0; i < $scope.themes.length; i++) {
                        $scope.themeLabels.push($scope.themes[i].label);

                        for (var j = 0; j < $scope.themes[i].subThemesList.length; j++) {
                            $scope.subThemeLabels.push($scope.themes[i].subThemesList[j].label);
                        }
                    }
                    $scope.subThemeLabels = themeService.unique($scope.subThemeLabels);
                    $scope.themeLabels = themeService.unique($scope.themeLabels);

                });

            }
            getThemeList($scope.theme.activityId);

            function addTheme() {
                var exist = false;
                $scope.themes.forEach(function(b) {
                	if($scope.theme.label==b.label)
                	    exist=true;
                });
                if (exist === false) {
                    themeRestAPI.addTheme($scope.theme).success(function(data) {

                        $scope.theme = data;
                        $window.history.back();

                    });
                }
                else
                    {
                      $scope.exist.value="visible";
                        
                    }
            }
            $scope.deleteSubTheme = function(id) {

                $scope.theme.subThemesList.splice(id, 1);
            };
            $scope.addSubTheme = function() {

                $scope.theme.subThemesList.push({
                    "label" : "",
                    "description" : ""
                });
            };
            $scope.cancel = function() {
                $window.history.back();
            };

            $scope.addTheme = function() {

                addTheme();
            };

        })

.controller(
        'EditThemeCtrl',
        function($log, $route, $routeParams, $scope, $rootScope, $timeout, $modal, structureCfgRestAPI, themeRestAPI, eventbus, groupAPI, effectiveRestAPI, statAPI, profileRestAPI, $q, ngTableParams,
                $filter, $location, $translatePartialLoader, $window, themeService, user, meta) {
            $translatePartialLoader.addPart('training');
            var idTheme = $routeParams.idTheme;
            $scope.theme = {};
            $scope.themes = [];
            $scope.themeLabels = [];
            $scope.subThemeLabels = [];
            $scope.exist = {};
            $scope.exist.value="hidden";
            function getTheme(id) {
                themeRestAPI.getTheme(id).success(function(data) {

                    $scope.theme = data;

                });

            }

            $scope.theme.author = {
                _id : user._id,
                name : user.name,
                firstname : user.firstname,
                avatar : user.avatar,
                contact : user.contact
            };
            $scope.theme.activityId = meta.activity.code;
            $scope.theme.structureId = meta.structure._id;
            function getThemeList(activityId) {
                themeRestAPI.getListTheme(activityId).success(function(data) {

                    $scope.themes = data;
                    for (var i = 0; i < $scope.themes.length; i++) {
                        $scope.themeLabels.push($scope.themes[i].label);

                        for (var j = 0; j < $scope.themes[i].subThemesList.length; j++) {
                            $scope.subThemeLabels.push($scope.themes[i].subThemesList[j].label);
                        }
                    }
                    $scope.subThemeLabels = themeService.unique($scope.subThemeLabels);
                    $scope.themeLabels = themeService.unique($scope.themeLabels);

                });

            }
            getThemeList($scope.theme.activityId);
            function updateTheme() {
                var exist = false;
                $scope.themes.forEach(function(b) {
                    if($scope.theme.label==b.label && b._id !=$scope.theme._id )
                        exist=true;
                });
                if (exist === false) {
                    themeRestAPI.updateTheme($scope.theme).success(function(data) {

                        $scope.theme = data;
                        $window.history.back();

                    });
                }
                else
                    {
                      $scope.exist.value="visible";
                        
                    }
               
            }
            $scope.deleteSubTheme = function(id) {

                $scope.theme.subThemesList.splice(id, 1);
            };
            $scope.addSubTheme = function() {

                $scope.theme.subThemesList.push({
                    "label" : "",
                    "description" : ""
                });
            };
            $scope.cancel = function() {
                $window.history.back();
            };

            $scope.editTheme = function() {

                updateTheme();
            };
            getTheme(idTheme);

        });
