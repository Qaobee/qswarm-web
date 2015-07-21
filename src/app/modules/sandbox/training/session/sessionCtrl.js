/**
 * Module that shows the training's theme and subTheme
 * 
 * @author Mohamed EL MARZGIOUI
 * @class qaobee.prive.training.session
 * @namespace qaobee.prive.training.session
 * 
 * @copyright <b>QaoBee</b>.
 */
angular.module(
        'sessionMod',
        [ 'common-config', 'labelsAPI', 'structureCfgRestAPI', 'summarysheet', 'effectiveRestAPI', 'ngTable', 'ngTableExport', 'statWidget', 'userMetaAPI', 'staffListWidget',
                'unavailableEffectiveWidget', 'palmaresEffectiveWidget', 'profileRestAPI', 'groupAPI', 'labelsAPI', 'statAPI', 'themeService', 'activityCfgRestAPI', 'effectiveSearch', 'locationAPI',
                'ui.utils', 'personRestAPI', 'flow', 'sessionRestAPI' ]).config(function($routeProvider, metaDatasProvider) {
    'use strict';
    $routeProvider.when('/private/training/addSession', {
        controller : 'AddSessionCtrl',
        reloadOnSearch : false,
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/training/session/addSession.html'
    }).when('/private/training/session/SearchSession', {
        controller : 'SearchSessionCtrl',
        reloadOnSearch : false,
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/training/session/searchSession.html'
    }).when('/private/training/editSession/:id', {
        controller : 'EditSessionCtrl',
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/training/session/editSession.html'
    });
}).config([ 'flowFactoryProvider', function(flowFactoryProvider) {
    flowFactoryProvider.defaults = {
        singleFile : true
    };
} ])
/**
 * @class qaobee.prive.training.AddSessionCtrl
 * @description Controller of templates/prive/training/session/addSession.html
 */

.controller(
        'AddSessionCtrl',
        function($log, $route, $routeParams, $scope, $rootScope, $timeout, sessionRestAPI, exerciseRestAPI, $modal, structureCfgRestAPI, themeRestAPI, eventbus, groupAPI, effectiveRestAPI, statAPI,
                profileRestAPI, $q, ngTableParams, $filter, $location, $translatePartialLoader, themeService, $window, user, meta) {
            $translatePartialLoader.addPart('training');

            $scope.categories = [];
            $scope.session = {};
            $scope.session.categoryAge = {};
            $scope.theme = {};

            $scope.themes = [];
            $scope.themeLabels = [];
            $scope.subthemesListAutoComplete = [];
            $scope.subThemeLabels = [];
            $scope.themesListAutoComplete = [];
            $scope.session.author = {};
            $scope.session.author._id = user._id;
            $scope.session.author.name = user.name;
            $scope.session.author.firstname = user.firstname;
            $scope.session.theme = {};
            $scope.session.subTheme = {};
            $scope.session.theme.label = '';
            $scope.session.subTheme.label = '';
            $scope.theme.activityId = meta.activity.code;
            $scope.historySession = {};
            $scope.historySession.author = {};
            $scope.session.historyList = [];
            $scope.session.exerciseSessionList = [];
            $scope.session.activityId = meta.activity.code;
            $scope.session.structureId = meta.structure._id;
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
                        $scope.session.categoryAge = b;
                    } else {
                        b.listStaffMember.forEach(function(c) {
                            if (c.personId === $scope.user._id) {
                                $scope.currentCategory = b;
                                $scope.session.categoryAge = b;
                                found = true;
                            }
                        });
                    }
                });
                if (!found) {
                    $scope.currentCategory = data[0];
                    $scope.session.categoryAge = data[0];
                }

            });

            $scope.cancel = function() {
                $window.history.back();
            };
            $scope.$watch(function() {
                return $filter('translate')('training.session.maintitle');
            }, function(newval) {
                eventbus.prepForBroadcast("title", newval);
            });
            $scope.$watch('session.theme.label', function(newValue, oldValue) {
                if (typeof $scope.session.subTheme !== "undefined") {
                    $scope.session.subTheme.label = '';
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

            $scope.addSession = function() {
                if ($scope.session.theme.label !== "") {
                    var themeExist = $scope.themesListAutoComplete.indexOf($scope.session.theme.label);
                    // Add new theme
                    if (themeExist == -1) {
                        $scope.theme.label = $scope.session.theme.label;
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
                            "label" : $scope.session.subTheme.label
                        });
                        themeRestAPI.addTheme($scope.theme).success(function(data) {

                            $scope.theme = data;

                        });
                    } else {
                        // update theme
                        if ($scope.session.subTheme.label !== "") {
                            var subthemExist = $scope.subthemesListAutoComplete.indexOf($scope.session.subTheme.label);
                            if (subthemExist == '-1') {
                                $scope.theme.subThemesList.push({
                                    "label" : $scope.session.subTheme.label
                                });
                                themeRestAPI.updateTheme($scope.theme).success(function(data) {

                                    $scope.theme = data;

                                });
                            }
                        }
                    }
                }
                $scope.historySession.author._id = user._id;
                $scope.historySession.author.name = user.name;
                $scope.historySession.author.firstname = user.firstname;
                $scope.historySession.historyType = "creation";
                $scope.historySession.date = new Date();
                $scope.session.dateCreate = new Date();
                $scope.session.historyList.push($scope.historySession);
                delete $scope.session.categoryAge.listStaffMember;

                sessionRestAPI.addSession($scope.session).success(function(data) {

                    $scope.session = data;
                    $window.history.back();

                });
            };
            $scope.addExerciseToSession = function(id) {

                exerciseRestAPI.getExercise(id).success(function(data) {

                    $scope.exercise = data;
                    $scope.exerciseSession = {};
                    $scope.exerciseSession.exercise = $scope.exercise;
                    $scope.isThemeCollapsed = true;
                    $scope.session.exerciseSessionList.push($scope.exerciseSession.exercise);

                });

            };
            $scope.deleteExerciseSession = function(id) {

                $scope.session.exerciseSessionList.splice(id, 1);
            };

        })

/**
 * @class qaobee.prive.training.EditSessionCtrl
 * @description Controller of templates/prive/training/session/editSession.html
 */
.controller(
        'EditSessionCtrl',
        function($log, $route, $routeParams, $scope, $rootScope, $timeout, $modal, structureCfgRestAPI, eventbus, groupAPI, exerciseRestAPI, statAPI, profileRestAPI, $q, ngTableParams, $filter,
                $location, $translatePartialLoader, sessionRestAPI, $window, user, themeService, $log, meta, themeRestAPI, personRestAPI) {
            $translatePartialLoader.addPart('training');
            $scope.theme = {};
            $scope.themes = [];
            $scope.themeLabels = [];
            $scope.subthemesListAutoComplete = [];
            $scope.subThemeLabels = [];
            $scope.session = {};
            $scope.session.file = {};
            $scope.historySession = {};
            $scope.session.categoryAge = {};
            $scope.historySession.author = {};
            $scope.session.historyList = [];
            $scope.session.commentList = [];
            $scope.commentList = [];
            $scope.comment = {};
            $scope.comentValue = {};
            $scope.theme.activityId = meta.activity.code;
            $scope.session.author = {};
            $scope.userCorrent = user;
            $scope.comentValue.value = "";
            $scope.authorPicture = user.avatar;
            $scope.session.author._id = user._id;
            $scope.session.author.name = user.name;
            $scope.session.author.firstname = user.firstname;
            $scope.isThemeCollapsed = true;
            $scope.count = 0;
            $scope.sessionId = $routeParams.id;
            sessionRestAPI.getSession($routeParams.id).success(function(data) {

                $scope.session = data;
                $scope.categories.forEach(function(b) {

                    if ($scope.session.categoryAge.code === b.code) {
                        $scope.session.categoryAge = b;
                    }
                });
                // list comment
                var listIdUsers = [];
                var listFields = [];
                listFields.push("avatar");
                listFields.push("name");
                listFields.push("firstname");
                if (typeof $scope.session.commentList !== "undefined") {
                    for (var i = 0; i < $scope.session.commentList.length; i++) {
                        listIdUsers.push($scope.session.commentList[i].authorId);
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
                                        comment : $scope.session.commentList[i]
                                    };
                                }

                            }
                            $scope.commentList.push(object);
                        }

                    });
                } else {
                    $scope.session.commentList = [];
                }
            });

            var promise = themeService.getThemes($scope.theme.activityId);

            promise.then(function(data) {
                $scope.themes = data;
                for (var i = 0; i < $scope.themes.data.length; i++) {
                    $scope.themeLabels.push($scope.themes.data[i].label);

                }
                $scope.themesListAutoComplete = themeService.unique($scope.themeLabels);
                $scope.$watch('session.theme.label', function(newValue, oldValue) {
                    $scope.count++;
                    if (typeof $scope.session.subTheme !== "undefined" && $scope.count > 2) {
                        $scope.session.subTheme.label = '';
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
                return $filter('translate')('training.session.maintitle');
            }, function(newval) {
                eventbus.prepForBroadcast("title", newval);
            });
            $scope.addExerciseToSession = function(id) {

                exerciseRestAPI.getExercise(id).success(function(data) {

                    $scope.exercise = data;
                    $scope.exerciseSession = {};
                    $scope.exerciseSession.exercise = $scope.exercise;
                    $scope.session.exerciseSessionList.push($scope.exerciseSession.exercise);

                });

            };
            $scope.cancel = function() {
                $window.history.back();
            };

            $scope.addComent = function() {
                $scope.comment = {};
                $scope.comment.authorId = user._id;
                $scope.comment.dateCreate = new Date();
                $scope.comment.content = $scope.comentValue.value;
                $scope.session.commentList.push($scope.comment);
                // show comments
                var object = {
                    author : user,
                    comment : $scope.comment
                };

                $scope.commentList.push(object);

                $scope.comentValue.value = "";
                $scope.session._id = $scope.sessionId;
                sessionRestAPI.updateSession($scope.session).success(function(data) {

                    $scope.session = data;

                });

            };
            $scope.removeComent = function(id) {

                var index = $scope.session.commentList.indexOf($scope.commentList[id].comment);
                $scope.session.commentList.splice(index, 1);
                $scope.commentList.splice(id, 1);
                $scope.session._id = $scope.sessionId;
                sessionRestAPI.updateSession($scope.session).success(function(data) {

                    $scope.session = data;

                });

            };
            $scope.editComent = function(id) {

                $scope.comentValue.value = $scope.commentList[id].comment.content;
                var index = $scope.session.commentList.indexOf($scope.commentList[id].comment);
                $scope.session.commentList.splice(index, 1);
                $scope.commentList.splice(id, 1);

            };

            $scope.updateSession = function() {
                if ($scope.session.theme.label !== "") {
                    var themeExist = $scope.themesListAutoComplete.indexOf($scope.session.theme.label);
                    // Add new theme
                    if (themeExist == -1) {
                        $scope.theme.label = $scope.session.theme.label;
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
                            "label" : $scope.session.subTheme.label
                        });
                        themeRestAPI.addTheme($scope.theme).success(function(data) {

                            $scope.theme = data;

                        });
                    } else {
                        if ($scope.session.subTheme.label !== "") {
                            // update theme
                            var subthemExist = $scope.subthemesListAutoComplete.indexOf($scope.session.subTheme.label);
                            if (subthemExist == '-1') {
                                $scope.theme.subThemesList.push({
                                    "label" : $scope.session.subTheme.label
                                });
                                themeRestAPI.updateTheme($scope.theme).success(function(data) {

                                    $scope.theme = data;

                                });
                            }
                        }
                    }
                }
                $scope.historySession.author._id = user._id;
                $scope.historySession.author.name = user.name;
                $scope.historySession.author.firstname = user.firstname;
                $scope.historySession.date = new Date();
                $scope.historySession.historyType = "modification";
                if (typeof $scope.session.commentList == "undefined") {
                    $scope.session.commentList = [];
                }

                $scope.session.historyList.push($scope.historySession);
                delete $scope.session.categoryAge.listStaffMember;
                $scope.session._id = $scope.sessionId;
                sessionRestAPI.updateSession($scope.session).success(function(data) {

                    $scope.session = data;
                    $window.history.back();

                });

            };
            $scope.deleteExerciseSession = function(id) {

                $scope.session.exerciseSessionList.splice(id, 1);
            };

        }).controller(
        'SearchSessionCtrl',
        function($log, $route, $routeParams, $scope, $rootScope, $timeout, $modal, structureCfgRestAPI, eventbus, groupAPI, effectiveRestAPI, statAPI, profileRestAPI, $q, ngTableParams, $filter,
                $location, $translatePartialLoader, exerciseRestAPI, $window, user, themeService, $log, meta, sessionRestAPI, personRestAPI) {
            $translatePartialLoader.addPart('training');
            $scope.sessionsList = [];
            $scope.session = {};
            $scope.session.categoryAge = {};
            exits = 0;
            listTempSession = [];
            $scope.searchSession = function() {

                sessionRestAPI.getListSession($scope.session.categoryAge.label, $scope.session.author, $scope.session.theme, $scope.session.subTheme, $scope.session.label).success(function(data) {

                    $scope.sessionsList = data;
                    $scope.sessionsList.forEach(function(it) {
                        if ($scope.session.key !== "") {
                            if (typeof it.description !== "undefined") {
                                exits = it.description.indexOf($scope.session.key);
                                if (exits !== -1) {
                                    listTempSession.push(it);

                                }
                            }
                        }

                    });
                    if (listTempSession.length !== 0) {
                        $scope.sessionsList = listTempSession;
                    }

                });

            };
            $scope.$watch(function() {
                return $filter('translate')('training.session.search');
            }, function(newval) {
                eventbus.prepForBroadcast("title", newval);
            });
            /* Retrieve list of category for structure */
            structureCfgRestAPI.getCategoriesAgeStrList($scope.meta.season.code, $scope.meta.structure._id).success(function(data) {
                $scope.categories = data;
                var found = false;
                data.forEach(function(b) {
                    if ($scope.currentCategoryId === b.code) {
                        found = true;
                        $scope.currentCategory = b;
                        $scope.session.categoryAge = b;
                    } else {
                        b.listStaffMember.forEach(function(c) {
                            if (c.personId === $scope.user._id) {
                                $scope.currentCategory = b;
                                $scope.session.categoryAge = b;
                                found = true;
                            }
                        });
                    }
                });
                if (!found) {
                    $scope.currentCategory = data[0];
                    $scope.session.categoryAge = data[0];
                }

            });
            $scope.cancel = function() {
                $window.history.back();
            };

        });