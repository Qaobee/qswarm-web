/**
 * Module that shows the training's theme and subTheme
 * 
 * @author Mohamed EL MARZGIOUI
 * @class qaobee.prive.training.exercise
 * @namespace qaobee.prive.training.exercise
 * 
 * @copyright <b>QaoBee</b>.
 */
angular.module(
        'exerciseMod',
        [ 'common-config', 'labelsAPI', 'structureCfgRestAPI', 'summarysheet', 'effectiveRestAPI', 'ngTable', 'ngTableExport', 'statWidget', 'userMetaAPI', 'staffListWidget',
                'unavailableEffectiveWidget', 'palmaresEffectiveWidget', 'profileRestAPI', 'groupAPI', 'labelsAPI', 'statAPI', 'themeService', 'activityCfgRestAPI', 'effectiveSearch', 'locationAPI',
                'ui.utils', 'personRestAPI', 'flow', 'exerciseRestAPI', 'personRestAPI' ]).config(function($routeProvider, metaDatasProvider) {
    'use strict';
    $routeProvider.when('/private/training/addExercise', {
        controller : 'AddExerciseCtrl',
        reloadOnSearch : false,
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/training/exercise/addExercise.html'
    }).when('/private/training/SearchExerciseForSession', {
        controller : 'SearchExerciseCtrl',
        reloadOnSearch : false,
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/training/session/addExerciseToSession.html'
    }).when('/private/training/exercise/SearchExercise', {
        controller : 'SearchExerciseCtrl',
        reloadOnSearch : false,
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/training/exercise/searchExercise.html'
    }).when('/private/training/editExercise/:id', {
        controller : 'EditExerciseCtrl',
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/training/exercise/editExercise.html'
    });
}).config([ 'flowFactoryProvider', function(flowFactoryProvider) {
    flowFactoryProvider.defaults = {
        singleFile : true
    };
} ])

.controller(
        'AddExerciseCtrl',
        function($log, $route, $routeParams, $scope, $rootScope, $timeout, exerciseRestAPI, $modal, structureCfgRestAPI, themeRestAPI, eventbus, groupAPI, effectiveRestAPI, statAPI, profileRestAPI,
                $q, ngTableParams, $filter, $location, $translatePartialLoader, themeService, $window, user, meta) {
            $translatePartialLoader.addPart('training');

            $scope.categories = [];
            $scope.exercise = {};

            $scope.exercise.subTheme = {};
            $scope.exercise.categoryAge = {};
            $scope.theme = {};
            $scope.exercise.theme = {};
            $scope.exercise.theme.label = '';
            $scope.exercise.subTheme.label = '';
            $scope.themes = [];
            $scope.themeLabels = [];
            $scope.subthemesListAutoComplete = [];
            $scope.subThemeLabels = [];
            $scope.themesListAutoComplete = [];
            $scope.exercise.author = {};
            $scope.exercise.author._id = user._id;
            $scope.exercise.author.name = user.name;
            $scope.exercise.author.firstname = user.firstname;
            $scope.exercise.file = {};
            $scope.historyExercise = {};
            $scope.historyExercise.author = {};
            $scope.exercise.historyList = [];
            $scope.exercise.activityId = meta.activity.code;
            $scope.exercise.structureId = meta.structure._id;
            $scope.count = 0;
            var promise = themeService.getThemes($scope.exercise.activityId);

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
                        $scope.exercise.categoryAge = b;
                    } else {
                        b.listStaffMember.forEach(function(c) {
                            if (c.personId === $scope.user._id) {
                                $scope.currentCategory = b;
                                $scope.exercise.categoryAge = b;
                                found = true;
                            }
                        });
                    }
                });
                if (!found) {
                    $scope.currentCategory = data[0];
                    $scope.exercise.categoryAge = data[0];
                }

            });

            $scope.cancel = function() {
                $window.history.back();
            };
            $scope.$watch(function() {
                return $filter('translate')('training.exercise.maintitle');
            }, function(newval) {
                eventbus.prepForBroadcast("title", newval);
            });
            $scope.$watch('exercise.theme.label', function(newValue, oldValue) {
                $scope.count++;
                if (typeof $scope.exercise.subTheme !== "undefined" && $scope.count > 2) {
                    $scope.exercise.subTheme.label = '';
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

            }, true);
            $scope.addExercise = function(e) {
                console.debug(e.files[0]);
                if (typeof e.files[0] !== "undefined") {
                    $scope.exercise.file = e.files[0].file;
                }
                $scope.historyExercise.author._id = user._id;
                $scope.historyExercise.author.name = user.name;
                $scope.historyExercise.author.firstname = user.firstname;
                $scope.historyExercise.historyType = "creation";
                $scope.historyExercise.date = new Date();
                $scope.exercise.dateCreate = new Date();
                $scope.exercise.historyList.push($scope.historyExercise);
                delete $scope.exercise.categoryAge.istStaffMember;
                if ($scope.exercise.theme.label !== "") {
                    var themeExist = $scope.themesListAutoComplete.indexOf($scope.exercise.theme.label);
                    // Add new theme
                    if (themeExist == -1) {
                        $scope.theme.label = $scope.exercise.theme.label;
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
                            "label" : $scope.exercise.subTheme.label
                        });
                        themeRestAPI.addTheme($scope.theme).success(function(data) {

                            $scope.theme = data;

                        });
                    } else {
                        // update theme
                        if ($scope.exercise.subTheme.label !== "") {
                            var subthemExist = $scope.subthemesListAutoComplete.indexOf($scope.exercise.subTheme.label);
                            if (subthemExist == '-1') {
                                $scope.theme.subThemesList.push({
                                    "label" : $scope.exercise.subTheme.label
                                });
                                themeRestAPI.updateTheme($scope.theme).success(function(data) {

                                    $scope.theme = data;

                                });
                            }
                        }
                    }
                }
                exerciseRestAPI.addExercise($scope.exercise).success(function(data) {

                    $scope.exercise = data;
                    $window.history.back();

                });
            };

        })

/**
 * @class qaobee.prive.training.EditExerciseCtrl
 * @description Controller of
 *              templates/prive/training/exercise/editExercise.html
 */
.controller(
        'EditExerciseCtrl',
        function($log, $route, $routeParams, $scope, $rootScope, $timeout, $modal, structureCfgRestAPI, eventbus, groupAPI, effectiveRestAPI, statAPI, profileRestAPI, $q, ngTableParams, $filter,
                $location, $translatePartialLoader, exerciseRestAPI, $window, user, themeService, $log, meta, themeRestAPI, personRestAPI) {
            $translatePartialLoader.addPart('training');
            $scope.theme = {};
            $scope.themes = [];
            $scope.themeLabels = [];
            $scope.subthemesListAutoComplete = [];
            $scope.subThemeLabels = [];
            $scope.exercise = {};
            $scope.exercise.file = {};
            $scope.historyExercise = {};
            $scope.exercise.categoryAge = {};
            $scope.historyExercise.author = {};
            $scope.exercise.historyList = [];
            $scope.exercise.commentList = [];
            $scope.commentList = [];
            $scope.comment = {};
            $scope.comentValue = {};
            $scope.comentValue.value = "";
            $scope.authorPicture = user.avatar;
            $scope.userCorrent = user;
            $scope.exercise.author = {};
            $scope.theme.activityId = meta.activity.code;
            $scope.theme.structureId = meta.structure._id;
            $scope.exercise.author._id = user._id;
            $scope.exercise.author.name = user.name;
            $scope.exercise.author.firstname = user.firstname;
            $scope.count = 0;
            $scope.users = [];
            $scope.exerciseId = $routeParams.id;
            /* retrieve person information */

            exerciseRestAPI.getExercise($routeParams.id).success(function(data) {

                $scope.exercise = data;

                $scope.categories.forEach(function(b) {

                    if ($scope.exercise.categoryAge.code === b.code) {
                        $scope.exercise.categoryAge = b;
                    }
                });
                // list comment
                var listIdUsers = [];
                var listFields = [];
                listFields.push("avatar");
                listFields.push("name");
                listFields.push("firstname");
                if (typeof $scope.exercise.commentList !== "undefined") {
                    for (var i = 0; i < $scope.exercise.commentList.length; i++) {
                        listIdUsers.push($scope.exercise.commentList[i].authorId);
                    }

                    var promise = personRestAPI.getListPerson(listIdUsers, listFields);
                    promise.then(function(data) {
                        $scope.users = data.data;

                        for (var i = 0; i < listIdUsers.length; i++) {
                            var object = {};
                            for (var j = 0; j < $scope.users.length; j++) {
                                if (listIdUsers[i] == $scope.users[j]._id) {
                                    object = {

                                        author : $scope.users[j],
                                        comment : $scope.exercise.commentList[i]
                                    };
                                }

                            }
                            $scope.commentList.push(object);
                        }

                    });
                } else {
                    $scope.exercise.commentList = [];
                }
            });

            var promise = themeService.getThemes($scope.theme.activityId);

            promise.then(function(data) {
                $scope.themes = data;
                for (var i = 0; i < $scope.themes.data.length; i++) {
                    $scope.themeLabels.push($scope.themes.data[i].label);

                }

                $scope.themesListAutoComplete = themeService.unique($scope.themeLabels);
                $scope.$watch('exercise.theme.label', function(newValue, oldValue) {
                    $scope.count++;
                    if (typeof $scope.exercise.subTheme !== "undefined" && $scope.count > 2) {
                        $scope.exercise.subTheme.label = '';
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

            });
            $scope.$watch(function() {
                return $filter('translate')('training.exercise.maintitle');
            }, function(newval) {
                eventbus.prepForBroadcast("title", newval);
            });
            $scope.cancel = function() {
                $window.history.back();
            };

            $scope.addComent = function() {
                $scope.comment = {};
                $scope.comment.authorId = user._id;
                $scope.comment.dateCreate = new Date();
                $scope.comment.content = $scope.comentValue.value;
                $scope.exercise.commentList.push($scope.comment);
                // show comments
                var object = {
                    author : user,
                    comment : $scope.comment
                };

                $scope.commentList.push(object);

                $scope.comentValue.value = "";
                $scope.exercise._id = $scope.exerciseId;
                exerciseRestAPI.updateExercise($scope.exercise).success(function(data) {

                    $scope.exercise = data;

                });

            };
            $scope.removeComent = function(id) {

                var index = $scope.exercise.commentList.indexOf($scope.commentList[id].comment);
                $scope.exercise.commentList.splice(index, 1);
                $scope.commentList.splice(id, 1);
                $scope.exercise._id = $scope.exerciseId;
                exerciseRestAPI.updateExercise($scope.exercise).success(function(data) {

                    $scope.exercise = data;

                });
            };
            $scope.editComent = function(id) {

                $scope.comentValue.value = $scope.commentList[id].comment.content;
                var index = $scope.exercise.commentList.indexOf($scope.commentList[id].comment);
                $scope.exercise.commentList.splice(index, 1);
                $scope.commentList.splice(id, 1);

            };
            $scope.updateExercise = function(e, $parent) {
                if (typeof e.files[0] !== "undefined") {
                    $scope.exercise.file = e.files[0].file;
                }
                if ($scope.exercise.theme.label !== "") {
                    var themeExist = $scope.themesListAutoComplete.indexOf($scope.exercise.theme.label);
                    // Add new theme
                    if (themeExist == -1) {
                        $scope.theme.label = $scope.exercise.theme.label;
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
                            "label" : $scope.exercise.subTheme.label
                        });
                        themeRestAPI.addTheme($scope.theme).success(function(data) {

                            $scope.theme = data;

                        });
                    } else {
                        // update theme
                        if ($scope.exercise.subTheme.label !== "") {
                        var subthemExist = $scope.subthemesListAutoComplete.indexOf($scope.exercise.subTheme.label);
                        if (subthemExist == '-1') {
                            $scope.theme.subThemesList.push({
                                "label" : $scope.exercise.subTheme.label
                            });
                            themeRestAPI.updateTheme($scope.theme).success(function(data) {

                                $scope.theme = data;

                            });
                         }
                        }
                    }
                }
                $scope.historyExercise.author._id = user._id;
                $scope.historyExercise.author.name = user.name;
                $scope.historyExercise.author.firstname = user.firstname;
                $scope.historyExercise.date = new Date();
                $scope.historyExercise.historyType = "modification";
                if (typeof $scope.exercise.commentList == "undefined") {
                    $scope.exercise.commentList = [];
                }

                $scope.exercise.historyList.push($scope.historyExercise);
                delete $scope.exercise.categoryAge.listStaffMember;
                $scope.exercise._id = $scope.exerciseId;
                exerciseRestAPI.updateExercise($scope.exercise).success(function(data) {

                    $scope.exercise = data;
                    $window.history.back();

                });

            };

        })

.controller(
        'SearchExerciseCtrl',
        function($log, $route, $routeParams, $scope, $rootScope, $timeout, $modal, structureCfgRestAPI, eventbus, groupAPI, effectiveRestAPI, statAPI, profileRestAPI, $q, ngTableParams, $filter,
                $location, $translatePartialLoader, exerciseRestAPI, $window, user, themeService, $log, meta, exerciseRestAPI, personRestAPI) {
            $translatePartialLoader.addPart('training');
            $scope.exercisesList = [];
            $scope.exercise = {};
            $scope.exercise.categoryAge = {};
            exits = 0;
            listTempExercise = [];
            $scope.searchExercise = function() {

                exerciseRestAPI.getListExercise($scope.exercise.categoryAge.label, $scope.exercise.author, $scope.exercise.theme, $scope.exercise.subTheme, $scope.exercise.label).success(
                        function(data) {

                            $scope.exercisesList = data;
                            $scope.exercisesList.forEach(function(it) {
                                if ($scope.exercise.key !== "") {
                                    if (typeof it.description !== "undefined") {
                                        exits = it.description.indexOf($scope.exercise.key);
                                        if (exits !== -1) {
                                            listTempExercise.push(it);

                                        }
                                    }
                                }

                            });
                            if (listTempExercise.length !== 0) {
                                $scope.exercisesList = listTempExercise;
                            }

                        });

            };
            $scope.$watch(function() {
                return $filter('translate')('training.exercise.search');
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
                                $scope.exercise.categoryAge = b;
                                found = true;
                            }
                        });
                    }
                });
                if (!found) {
                    $scope.currentCategory = data[0];
                    $scope.exercise.categoryAge = data[0];
                }

            });
            $scope.cancel = function() {
                $window.history.back();
            };

        });