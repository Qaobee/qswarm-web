/**
 * Module that shows the training dashboard
 * 
 * @author Mohamed EL MARZGIOUI
 * @class qaobee.prive.training
 * @namespace qaobee.prive.training
 * 
 * @copyright <b>QaoBee</b>.
 */
angular.module(
        'trainingMod',
        [ 'labelsAPI', 'structureCfgRestAPI', 'summarysheet', 'effectiveRestAPI', 'ngTable', 'ngTableExport', 'statWidget', 'userMetaAPI', 'staffListWidget', 'planingSessionWidget',
                'unavailableEffectiveWidget', 'palmaresEffectiveWidget', 'commonsDirectives', 'themeService', 'profileRestAPI', 'groupAPI', 'labelsAPI', 'statAPI', 'effectiveSearch',
                'exerciseRestAPI', 'themeRestAPI', 'locationAPI', 'ui.utils' ])

.config(function($routeProvider, metaDatasProvider) {
    'use strict';
    $routeProvider.when('/private/training/dashboard', {
        controller : 'TrainingDashboardCtrl',
        reloadOnSearch : false,
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/training/dashboard.html'
    }).when('/private/training/dashboardTheme', {
        controller : 'ThemeDashboardCtrl',
        reloadOnSearch : false,
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/training/theme/themeDashboard.html'
    });
})
/**
 * @class qaobee.prive.training.trainingCtrl
 * @description Controller of templates/prive/training/dashboard.html
 */
.controller(
        'TrainingDashboardCtrl',
        function($log, $route, $routeParams, $scope, $rootScope, $timeout, $modal, structureCfgRestAPI, eventbus, groupAPI, effectiveRestAPI, statAPI, profileRestAPI, $q, ngTableParams, $filter,$location, $translatePartialLoader, $window) {
            $translatePartialLoader.addPart('training');
            eventbus.prepForBroadcast("left-menu", 'training.dashboard');

            $scope.$watch(function() {
                return $filter('translate')('training.dashboard.title');
            }, function(newval) {
                eventbus.prepForBroadcast("title", newval);
            });

        })

.controller(
        'ThemeDashboardCtrl',
        function($log, $window, $route, $routeParams, $scope, $rootScope, themeRestAPI, $timeout, $modal, structureCfgRestAPI, eventbus, groupAPI, effectiveRestAPI, statAPI, profileRestAPI, $q,
                ngTableParams, $filter, $location, $translatePartialLoader, meta, user) {
            $translatePartialLoader.addPart('training');
            // return button
            $scope.doTheBack = function() {
                $window.history.back();
            };
           
            // initialize variables
            $scope.themes = [];
            $scope.checkboxValue={value :false, value1:false};
            $scope.exists = {};
//            $scope.themeLabel={};
//            $scope.themeLabel.label="";
//            $scope.exists.value="hidden";
            var activityId = meta.activity.code;
            var structureId= meta.structure._id;
            var authorId = user._id;
            function getThemeList(activityId) {
                themeRestAPI.getListTheme(activityId).success(function(data) {

                    $scope.themes = data;
                    $scope.temp = $scope.themes;
                });

            }
            $scope.$watch(function() {
                return $filter('translate')('training.dashboard.maintitle');
            }, function(newval) {
                eventbus.prepForBroadcast("title", newval);
            });

            $scope.onlyThemesCreatedByMe = function() {

                var result = [];
            
                if ($scope.checkboxValue.value===true) {
                    for (var i = 0; i < $scope.themes.length; i++) {
                        if (authorId == $scope.themes[i].author._id) {
                            result.push($scope.themes[i]);
                        }

                    }
                    $scope.themes = result;
                }else{
                    
                    $scope.themes=$scope.temp;
                }
                
            };
            $scope.onlyThemesOfMyStructure = function() {

                var result = [];
            
                if ($scope.checkboxValue.value1===true) {
                    for (var i = 0; i < $scope.themes.length; i++) {
                        if (structureId == $scope.themes[i].structureId) {
                            result.push($scope.themes[i]);
                        }

                    }
                    $scope.themes = result;
                }else{
                    
                    $scope.themes=$scope.temp;
                }
                
            };
//            $scope.$watch('themeLabel.label', function(newValue, oldValue) {
//                
//                var exist = false;
//                $scope.themes.forEach(function(b) {
//                    if($scope.themeLabel.label==b.label)
//                        exist=true;
//                });
//                if (exist === false &&  newValue != "") 
//                
//                    {
//                      $scope.exists.value="visible";
//                        
//                    }
//                
//            }, true);

            $scope.isThemeCollapsed = true;

            getThemeList(activityId);

        });
