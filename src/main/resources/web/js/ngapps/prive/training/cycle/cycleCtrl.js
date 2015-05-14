/**
 * Module that shows the training's theme and subTheme
 * 
 * @author Mohamed EL MARZGIOUI
 * @class qaobee.prive.training.cycle
 * @namespace qaobee.prive.training.cycle
 * 
 * @copyright <b>QaoBee</b>.
 */
angular.module(
        'cycleMod',
        [ 'common-config', 'labelsAPI', 'structureCfgRestAPI', 'summarysheet', 'effectiveRestAPI', 'ngTable', 'ngTableExport', 'statWidget', 'userMetaAPI', 'staffListWidget',
                'unavailableEffectiveWidget', 'palmaresEffectiveWidget', 'profileRestAPI', 'groupAPI', 'labelsAPI', 'statAPI', 'themeService', 'activityCfgRestAPI', 'effectiveSearch', 'locationAPI',
                'ui.utils', 'personRestAPI', 'flow', 'cycleRestAPI' ]).config(function($routeProvider, metaDatasProvider) {
    'use strict';
    $routeProvider.when('/private/training/addCycle', {
        controller : 'AddCycleCtrl',
        reloadOnSearch : false,
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/training/cycle/addCycle.html'

    }).when('/private/training/cycle/SearchCycle', {

      controller : 'SearchCycleCtrl',
        reloadOnSearch : false,
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/training/cycle/searchCycle.html'
    }).when('/private/training/editCycle/:id', {
        controller : 'EditCycleCtrl',
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/training/cycle/editCycle.html'
    });
}).config([ 'flowFactoryProvider', function(flowFactoryProvider) {
    flowFactoryProvider.defaults = {
        singleFile : true
    };
} ])
/**
 * @class qaobee.prive.training.AddCycleCtrl
 * @description Controller of templates/prive/training/cycle/addCycle.html
 */

.controller(
        'AddCycleCtrl',
        function($log, $route, $routeParams, $scope, $rootScope, $timeout, cycleRestAPI, sessionRestAPI, $modal, structureCfgRestAPI, themeRestAPI, eventbus, groupAPI, effectiveRestAPI, statAPI,
                profileRestAPI, $q, ngTableParams, $filter, $location, $translatePartialLoader, themeService, $window, user, meta) {
            $translatePartialLoader.addPart('training');

            $scope.categories = [];
            $scope.cycle = {};
            $scope.cycle.categoryAge = {};
            $scope.theme = {};
            $scope.themes = [];
            $scope.themeLabels = [];
            $scope.subthemesListAutoComplete = [];
            $scope.subThemeLabels = [];
            $scope.themesListAutoComplete = [];
            $scope.cycle.author = {};
            $scope.cycle.author._id = user._id;
            $scope.cycle.author.name = user.name;
            $scope.cycle.author.firstname = user.firstname;
            $scope.cycle.theme={};
            $scope.cycle.subTheme={};
            $scope.cycle.theme.label = '';
            $scope.cycle.subTheme.label = '';
            $scope.theme.activityId = meta.activity.code;
            $scope.historyCycle = {};
            $scope.historyCycle.author = {};
            $scope.cycle.historyList = [];
            $scope.cycle.sessionCycleList = [];
            $scope.cycle.activityId = meta.activity.code;
            $scope.cycle.structureId = meta.structure._id;
            var promise = themeService.getThemes($scope.theme.activityId);

            promise.then(function(data) {
                $scope.themes = data;
                for (var i = 0; i < $scope.themes.data.length; i++) {
                    $scope.themeLabels.push($scope.themes.data[i].label);

                }

                $scope.themesListAutoComplete = themeService.unique($scope.themeLabels);

            });

            /* Retrieve list of category for structure */
            structureCfgRestAPI.getCategoriesAgeStrList($scope.meta.season.code, $scope.meta.structure._id).success(function(data) {
                $scope.categories = data;
                var found = false;
                data.forEach(function(b) {
                    if ($scope.currentCategoryId === b.code) {
                        found = true;
                        $scope.currentCategory = b;
                        $scope.cycle.categoryAge = b;
                    } else {
                        b.listStaffMember.forEach(function(c) {
                            if (c.personId === $scope.user._id) {
                                $scope.currentCategory = b;
                                $scope.cycle.categoryAge = b;
                                found = true;
                            }
                        });
                    }
                });
                if (!found) {
                    $scope.currentCategory = data[0];
                    $scope.cycle.categoryAge = data[0];
                }

            });

            $scope.cancel = function() {
                $window.history.back();
            };
            $scope.$watch(function() {
                return $filter('translate')('training.cycle.maintitle');
            }, function(newval) {
                eventbus.prepForBroadcast("title", newval);
            });

            $scope.$watch('cycle.theme.label', function(newValue, oldValue) {
                if (typeof $scope.cycle.subTheme !== "undefined") {
                    $scope.cycle.subTheme.label = '';
                }
                $scope.subthemesListAutoComplete = [];
                if (typeof $scope.themes.data !== "undefined") {

                    for (var i = 0; i < $scope.themes.data.length; i++) {
                        if ($scope.themes.data[i].label == newValue) {
                            var nbrSubtheme = $scope.themes.data[i].subThemesList.length;
                            $scope.theme = $scope.themes.data[i];
                            for (var j = 0; j < nbrSubtheme; j++) {
                                $scope.subthemesListAutoComplete.push($scope.themes.data[i].subThemesList[j].label);

                            }
                            $scope.subthemesListAutoComplete = themeService.unique($scope.subthemesListAutoComplete);
                            break;
                        }
                    }

                }
                console.log($scope.subthemesListAutoComplete);

            }, true);
            $scope.addCycle = function() {
               if($scope.cycle.theme.label!==""){
                var themeExist =   $scope.themesListAutoComplete.indexOf($scope.cycle.theme.label);
                // Add new theme
                if (themeExist == -1) {
                    $scope.theme.label = $scope.cycle.theme.label;
                    $scope.theme.subThemesList = [];
                    $scope.theme.author = {
                        _id : user._id,
                        name : user.name,
                        firstname : user.firstname,
                        avatar : user.avatar,
                        contact : user.contact
                    };
                    $scope.theme.activityId = meta.activity.code;
                    $scope.theme.structureId = meta.structure._id;
                    $scope.theme.subThemesList.push({
                        "label" : $scope.cycle.subTheme.label
                    });
                    themeRestAPI.addTheme($scope.theme).success(function(data) {

                        $scope.theme = data;

                    });
                } else {
                    if($scope.cycle.subTheme.label!==""){
                    // update theme
                    var subthemExist = $scope.subthemesListAutoComplete.indexOf($scope.cycle.subTheme.label);
                    if (subthemExist == '-1') {
                        $scope.theme.subThemesList.push({
                            "label" : $scope.cycle.subTheme.label
                        });
                        themeRestAPI.updateTheme($scope.theme).success(function(data) {

                            $scope.theme = data;

                        });
                     }
                    }
                 }
               }
                $scope.historyCycle.author._id = user._id;
                $scope.historyCycle.author.name = user.name;
                $scope.historyCycle.author.firstname = user.firstname;
                $scope.historyCycle.historyType = "creation";
                $scope.historyCycle.date = new Date();
                $scope.cycle.dateCreate = new Date();
                $scope.cycle.historyList.push($scope.historyCycle);
                delete $scope.cycle.categoryAge.listStaffMember;

                cycleRestAPI.addCycle($scope.cycle).success(function(data) {

                    $scope.cycle = data;
                    $window.history.back();

                });
            };
            $scope.addSessionToCycle = function(id) {

                sessionRestAPI.getSession(id).success(function(data) {

                    $scope.session = data;
                    $scope.sessionCycle = {};
                    $scope.sessionCycle.session = $scope.session;
                    $scope.isThemeCollapsed = true;
                    $scope.cycle.sessionCycleList.push($scope.sessionCycle.session);

                });

            };
            $scope.deleteSession = function(id) {

                $scope.cycle.sessionCycleList.splice(id, 1);
            };

        })

/**
 * @class qaobee.prive.training.EditCycleCtrl
 * @description Controller of templates/prive/training/cycle/editCycle.html
 */
.controller(
        'EditCycleCtrl',
        function($log, $route, $routeParams, $scope, $rootScope, $timeout, $modal, structureCfgRestAPI, eventbus, groupAPI, sessionRestAPI, statAPI, profileRestAPI, $q, ngTableParams, $filter,
                $location, $translatePartialLoader, cycleRestAPI, $window, user, themeService, $log, meta, themeRestAPI,personRestAPI) {
            $translatePartialLoader.addPart('training');
            $scope.theme = {};
            $scope.themes = [];
            $scope.themeLabels = [];
            $scope.subthemesListAutoComplete = [];
            $scope.subThemeLabels = [];
            $scope.cycle = {};
            $scope.cycle.file = {};
            $scope.historyCycle = {};
            $scope.cycle.categoryAge = {};
            $scope.historyCycle.author = {};
            $scope.cycle.historyList = [];
            $scope.cycle.commentList = [];
         
            $scope.userCorrent = user;
            $scope.count = 0;
            
        
            $scope.commentList = [];
            $scope.comment = {};
            $scope.comentValue = {};
            $scope.comentValue.value = "";
            $scope.authorPicture = user.avatar;
            
            $scope.cycle.author = {};
            $scope.cycle.author._id = user._id;
            $scope.cycle.author.name = user.name;
            $scope.cycle.author.firstname = user.firstname;
            $scope.theme.activityId = meta.activity.code;
            $scope.isThemeCollapsed = true;
            $scope.cycleId=$routeParams.id;
            cycleRestAPI.getCycle($routeParams.id).success(function(data) {

                $scope.cycle = data;
                $scope.categories.forEach(function(b) {

                    if ($scope.cycle.categoryAge.code === b.code) {
                        $scope.cycle.categoryAge = b;
                    }
                });
             // list comment
                var listIdUsers = [];
                var listFields = [];
                listFields.push("avatar");
                listFields.push("name");
                listFields.push("firstname");
                if (typeof $scope.cycle.commentList !== "undefined" )
                    {
                for (var i = 0; i < $scope.cycle.commentList.length; i++) {
                    listIdUsers.push($scope.cycle.commentList[i].authorId);
                }

                var promise = personRestAPI.getListPerson(listIdUsers, listFields);
                promise.then(function(data) {
                    $scope.users = data.data;
              
                    for (var i = 0; i < listIdUsers.length; i++) {
                        var object={};
                        for (var j = 0; j < $scope.users.length; j++) {
                            if (listIdUsers[i] == $scope.users[j]._id) {
                               object = {

                                    author : $scope.users[j],
                                    comment : $scope.cycle.commentList[i]
                                };
                            }
                           
                        }
                        $scope.commentList.push(object);
                    }

                });
                }
                else
                {
                $scope.cycle.commentList=[];
                }

                            
            });

            var promise = themeService.getThemes($scope.theme.activityId);

            promise.then(function(data) {
                $scope.themes = data;
                for (var i = 0; i < $scope.themes.data.length; i++) {
                    $scope.themeLabels.push($scope.themes.data[i].label);

                }

                $scope.themesListAutoComplete = themeService.unique($scope.themeLabels);
                $scope.$watch('cycle.theme.label', function(newValue, oldValue) {
                    $scope.count++;
                    if (typeof $scope.cycle.subTheme !== "undefined" && $scope.count > 2) {
                        $scope.cycle.subTheme.label = '';
                    }
                    $scope.subthemesListAutoComplete = [];
                    if (typeof $scope.themes.data !== "undefined") {

                        for (var i = 0; i < $scope.themes.data.length; i++) {
                            if ($scope.themes.data[i].label == newValue) {
                                var nbrSubtheme = $scope.themes.data[i].subThemesList.length;
                                $scope.theme = $scope.themes.data[i];
                                for (var j = 0; j < nbrSubtheme; j++) {
                                    $scope.subthemesListAutoComplete.push($scope.themes.data[i].subThemesList[j].label);

                                }
                                $scope.subthemesListAutoComplete = themeService.unique($scope.subthemesListAutoComplete);
                                break;
                            }
                        }

                    }
                    console.log($scope.count);

                }, true);

            });
            $scope.$watch(function() {
                return $filter('translate')('training.cycle.maintitle');
            }, function(newval) {
                eventbus.prepForBroadcast("title", newval);
            });
            $scope.cancel = function() {
                $window.history.back();
            };
            $scope.addSessionToCycle = function(id) {

                sessionRestAPI.getSession(id).success(function(data) {

                    $scope.session = data;
                    $scope.sessionCycle = {};
                    $scope.sessionCycle.session = $scope.session;
                    $scope.cycle.sessionCycleList.push($scope.sessionCycle.session);

                });
            };

            $scope.addComent = function() {
                $scope.comment = {};
                $scope.comment.authorId = user._id;
                $scope.comment.dateCreate = new Date();
                $scope.comment.content = $scope.comentValue.value;
                $scope.cycle.commentList.push($scope.comment);
                // show comments
                var object = {
                    author : user,
                    comment : $scope.comment
                };

                $scope.commentList.push(object);

                $scope.comentValue.value = "";
                $scope.cycle._id=$scope.cycleId;
                cycleRestAPI.updateCycle($scope.cycle).success(function(data) {

                    $scope.cycle = data;
                   

                });

            };
            $scope.removeComent = function(id) {

                var index = $scope.cycle.commentList.indexOf($scope.commentList[id].comment);
                $scope.cycle.commentList.splice(index, 1);
                $scope.commentList.splice(id, 1);
                $scope.cycle._id=$scope.cycleId;
                cycleRestAPI.updateCycle($scope.cycle).success(function(data) {

                    $scope.cycle = data;
                   

                });
            };
            $scope.editComent = function(id) {

                $scope.comentValue.value = $scope.commentList[id].comment.content;
                var index = $scope.cycle.commentList.indexOf($scope.commentList[id].comment);
                $scope.cycle.commentList.splice(index, 1);
                $scope.commentList.splice(id, 1);

            };

            $scope.updateCycle = function() {
                if($scope.cycle.theme.label!==""){
                var themeExist =   $scope.themesListAutoComplete.indexOf($scope.cycle.theme.label);
                // Add new theme
                if (themeExist == -1) {
                    $scope.theme.label = $scope.cycle.theme.label;
                    $scope.theme.subThemesList = [];
                    $scope.theme.author = {
                        _id : user._id,
                        name : user.name,
                        firstname : user.firstname,
                        avatar : user.avatar,
                        contact : user.contact
                    };
                    $scope.theme.activityId = meta.activity.code;
                    $scope.theme.structureId = meta.structure._id;
                    $scope.theme.subThemesList.push({
                        "label" : $scope.cycle.subTheme.label
                    });
                    themeRestAPI.addTheme($scope.theme).success(function(data) {

                        $scope.theme = data;

                    });
                } else {
                    if($scope.cycle.subTheme.label!==""){
                    // update theme
                    var subthemExist = $scope.subthemesListAutoComplete.indexOf($scope.cycle.subTheme.label);
                    if (subthemExist == '-1') {
                        $scope.theme.subThemesList.push({
                            "label" : $scope.cycle.subTheme.label
                        });
                        themeRestAPI.updateTheme($scope.theme).success(function(data) {

                            $scope.theme = data;

                        });
                    }
                    }
                  }
                }
                $scope.historyCycle.author._id = user._id;
                $scope.historyCycle.author.name = user.name;
                $scope.historyCycle.author.firstname = user.firstname;
                $scope.historyCycle.date = new Date();
                $scope.historyCycle.historyType = "modification";
                if (typeof $scope.cycle.commentList == "undefined") {
                    $scope.cycle.commentList = [];
                }


                $scope.cycle.historyList.push($scope.historyCycle);
                delete $scope.cycle.categoryAge.listStaffMember;
                $scope.cycle._id=$scope.cycleId;
                cycleRestAPI.updateCycle($scope.cycle).success(function(data) {

                    $scope.cycle = data;
                    $window.history.back();

                });

            };
            $scope.deleteSession = function(id) {

                $scope.cycle.sessionCycleList.splice(id, 1);
            };

        })  
             .controller(
        'SearchCycleCtrl',
        function($log, $route, $routeParams, $scope, $rootScope, $timeout, $modal, structureCfgRestAPI, eventbus, groupAPI, effectiveRestAPI, statAPI, profileRestAPI, $q, ngTableParams, $filter,
                $location, $translatePartialLoader, exerciseRestAPI, $window, user, themeService, $log, meta, cycleRestAPI, personRestAPI) {
            $translatePartialLoader.addPart('training');
              $scope.cyclesList=[];
              $scope.cycle={};
              $scope.cycle.categoryAge={};
              exits=0;
              listTempCycle=[];
              $scope.searchCycle = function() {

                  cycleRestAPI.getListCycle($scope.cycle.categoryAge.label,$scope.cycle.author,$scope.cycle.theme,$scope.cycle.subTheme,$scope.cycle.label).success(function(data) {

                      $scope.cyclesList = data;
                      $scope.cyclesList.forEach(function(it) {
                          if($scope.cycle.key!=="")
                         {
                           if(typeof it.description !== "undefined")
                             {
                               exits= it.description.indexOf($scope.cycle.key);
                               if(exits !== -1)
                                   {
                                   listTempCycle.push(it);
                                   
                                   }
                             }
                         }
                          
                      });
                      if(listTempCycle.length!==0)
                        {
                          $scope.cyclesList=listTempCycle;
                        }

                   

                  });
                  

              };
              $scope.$watch(function() {
                  return $filter('translate')('training.cycle.search');
              }, function(newval) {
                  eventbus.prepForBroadcast("title", newval);
              });
              structureCfgRestAPI.getCategoriesAgeStrList($scope.meta.season.code, $scope.meta.structure._id).success(function(data) {
                  $scope.categories = data;
                  var found = false;
                  data.forEach(function(b) {
                      if ($scope.currentCategoryId === b.code) {
                          found = true;
                          $scope.currentCategory = b;
                          $scope.exercise.categoryAge = b;
                      } else {
                          b.listStaffMember.forEach(function(c) {
                              if (c.personId === $scope.user._id) {
                                  $scope.currentCategory = b;
                                  $scope.cycle.categoryAge = b;
                                  found = true;
                              }
                          });
                      }
                  });
                  if (!found) {
                      $scope.currentCategory = data[0];
                      $scope.cycle.categoryAge = data[0];
                  }

              });
              $scope.cancel = function() {
                      $window.history.back();
                  };

        });
