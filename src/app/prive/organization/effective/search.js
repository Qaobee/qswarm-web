angular.module(
    'effectiveSearch',
    ['labelsAPI', 'structureCfgRestAPI', 'effectiveRestAPI', 'personRestAPI','ngTable', 'ngTableExport',
        'statWidget', 'userMetaAPI', 'profileRestAPI', 'groupAPI', 'statAPI'])

    .config(function ($routeProvider, metaDatasProvider) {
        'use strict';
        $routeProvider.when('/private/effective/search/:currentCategory/:currentGroup', {
            controller: 'SimpleSearchPlayerCtrl',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'templates/prive/organization/effective/simpleSearch.html'
        }).when('/private/effective/advancedsearch/:currentCategory/:currentGroup', {
            controller: 'AdvancedSearchPlayerCtrl',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'templates/prive/organization/effective/advancedSearch.html'
        });
    })
/**
 * @class qaobee.prive.organization.effective.SimpleSearchPlayerCtrl
 * @description Controller of the modal templates/prive/organization/effective/simpleSearch.html
 */
    .controller('SimpleSearchPlayerCtrl', function ($log, $window, $route, $routeParams, $scope, $rootScope, $modal, $timeout, personRestAPI, eventbus, structureCfgRestAPI, groupAPI, effectiveRestAPI, statAPI, profileRestAPI, $q, ngTableParams, $filter, $location, $translatePartialLoader, user, meta) {
        var lastRoute = $route.current;
        $scope.$on('$locationChangeSuccess', function () {
            if (lastRoute.$$route.originalPath === $route.current.$$route.originalPath) {
                $route.current = lastRoute;
            }
        });
        $scope.currentCategoryId = $routeParams.currentCategory;
        $scope.currentGroupId = $routeParams.currentGroup;
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('stats');
        $scope.$watch(
            function () {
                return $filter('translate')('effective.simplesearch.title');
            },
            function (newval) {
                eventbus.prepForBroadcast("title", newval);
            }
        );
        $scope.categories = [];
        $scope.groups = [];
        $scope.effective = [];
        $scope.effectiveSave = [];
        $scope.selection = [];
        var effectiveprom = $q.defer();
        $scope.effectiveprom = effectiveprom.promise;
        $scope.meta = meta;
        structureCfgRestAPI.getCategoriesAgeStrList($scope.meta.season.code, $scope.meta.structure._id).success(function (data) {
            $scope.categories = data;
            var found = false;
            data.forEach(function (b) {
                if ($scope.currentCategoryId === b.code) {
                    found = true;
                    $scope.currentCategory = b;
                } else {
                    b.listStaffMember.forEach(function (c) {
                        if (c.personId === $scope.user._id) {
                            $scope.currentCategory = b;
                            found = true;
                        }
                    });
                }
            });
            if (!found) {
                $scope.currentCategory = data[0];
            }
        });
        
        // return button
        $scope.doTheBack = function () {
            $window.history.back();
        };

        /* Retrieve All active group */
        $scope.$watch('currentCategory', function (newValue, oldValue) {
            if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                $scope.groups = [];
                groupAPI.getActiveGroupsCategory($scope.meta.structure._id, newValue.code).success(function (data) {
                    $scope.groups.add({
                        label: 'Tous',
                        _id: '-1'
                    });
                    data.forEach(function (a) {
                        $scope.groups.push(a);
                    });
                    var found = false;
                    $scope.groups.forEach(function (g) {
                        if (g._id === $scope.currentGroupId) {
                            $scope.currentGroup = g;
                            found = true;
                        }
                    });
                    if (!found) {
                        $scope.currentGroup = $scope.groups[0];
                    }
                    $scope.getEffective();
                    $location.url('/private/effective/search/' + $scope.currentCategory.code + '/' + $scope.currentGroup._id);
                });
            }
        });

        /* Filter by group */
        $scope.$watch('currentGroup', function (newValue, oldValue) {
            if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                if (newValue._id !== '-1') {
                    $scope.groups.forEach(function (a) {
                        /* Select group */
                        if (a._id === newValue._id) {
                            var members = [];
                            /* loop on list person of the current group */
                            a.members.forEach(function (b) {
                                /* loop on effective list */
                                $scope.effectiveSave.forEach(function (c) {
                                    if (b === c._id) {
                                        members.push(c);
                                    }
                                });
                            });
                            /* refresh data */
                            effectiveprom.resolve(members);
                            $scope.effective = members;
                            $scope.tableEffectives.total(members.length);
                            $scope.tableEffectives.reload();
                            $location.url('/private/effective/search/' + $scope.currentCategory.code + '/' + $scope.currentGroup._id);
                        }
                    });
                } else {
                    $scope.getEffective();
                    $location.url('/private/effective/search/' + $scope.currentCategory.code + '/' + $scope.currentGroup._id);
                }
            }
        });

        $scope.tableEffectives = new ngTableParams({
            page: 1, // show first page
            count: 25, // count per page
            filter: {},
            sorting: {
                name: 'asc' // initial sorting
            }
        }, {
            total: function () {
                return $scope.effective.length;
            },
            counts: [],
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')($scope.effective, params.orderBy()) : $scope.effective;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                $timeout(function () {
                    $.material.init();
                }, 500);
            }
        });

        $scope.getEffective = function () {
            effectiveRestAPI.getListMemberEffective($scope.meta.season.code, $scope.meta.structure._id, $scope.currentCategory.code).success(function (data) {
                
                var listId = [];
                data.forEach(function (a) {
                    listId = a.members;
                });
                
                var listField = new Array("_id", "name", "firstname", "avatar", "status" );
                
                /* retrieve person information */
                personRestAPI.getListPerson(listId, listField).success(function (data) {
                    effectiveprom.resolve(data);
                    data.forEach(function (e) {
                        if (angular.isDefined(e.status.positionType)) {
                            e.positionType = $filter('translate')('stat.positionType.value.' + e.status.positionType);
                        } else {
                            e.positionType = '';
                        }
                        e.birthdate = $filter('date')(e.birthdate, 'yyyy');
                        e.age = moment().format("YYYY") - e.birthdate;
                        e.weight = e.status.weight;
                        e.height = e.status.height;
                    });
                    $scope.effective = data;
                    $scope.effectiveSave = data;
                    $scope.tableEffectives.total(data.length);
                    $scope.tableEffectives.reload();
                });
            });
        };

        $scope.displayPlayerSheet = function (id) {
            $location.path('/private/playersheet/' + id);
        };

        $scope.openCompareModal = function () {
            if ($scope.selection.length === 0) {
                toastr.warning($filter('translate')('effective.dashboard.selectionMin'));
            } else {
                $scope.players = [];
                $scope.effective.forEach(function (p) {
                    if ($scope.selection.find(p._id)) {
                        $scope.players.add(p);
                    }
                });
                $modal.open({
                    templateUrl: 'templates/prive/organization/effective/playerCompareModal.html',
                    controller: 'PlayerCompareCtrl',
                    size: 'lg',
                    resolve: {
                        players: function () {
                            return $scope.players;
                        },
                        meta: function () {
                            return $scope.meta;
                        }
                    }
                }).result.then(function () {
                        $scope.players = [];
                        $scope.selection = [];
                    }, function () {
                        $scope.players = [];
                        $scope.selection = [];
                    });
            }
        };
        $scope.toggleSelection = function toggleSelection(id) {
            var idx = $scope.selection.indexOf(id);
            // is currently selected
            if (idx > -1) {
                $scope.selection.splice(idx, 1);
            }
            // is newly selected
            else {
                // limit to 3 players
                if ($scope.selection.length === 3) {
                    angular.element("#check-" + id).attr("checked", false);
                    toastr.warning($filter('translate')('effective.dashboard.selectionLimit'));
                } else {
                    $scope.selection.push(id);
                }
            }
        };

        $scope.showAdvancedSearch = function () {
            $location.path('/private/effective/advancedsearch/' + $scope.currentCategory.code + '/' + $scope.currentGroup._id);
        };
    })
/**
 * @class qaobee.prive.organization.effective.AdvancedSearchPlayerCtrl
 * @description Controller of the modal templates/prive/organization/effective/advancedSearch.html
 */
    .controller('AdvancedSearchPlayerCtrl', function ($log, $window, $route, $routeParams, $scope, $timeout, $rootScope, $modal, personRestAPI, eventbus, structureCfgRestAPI, groupAPI, effectiveRestAPI, statAPI, profileRestAPI, $q, ngTableParams, $filter, $location, $translatePartialLoader, user, meta) {
        var lastRoute = $route.current;
        $scope.$on('$locationChangeSuccess', function () {
            if (lastRoute.$$route.originalPath === $route.current.$$route.originalPath) {
                $route.current = lastRoute;
            }
        });
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('stats');
        $scope.currentCategoryId = $routeParams.currentCategory;
        $scope.currentGroupId = $routeParams.currentGroup;
        $scope.$watch(
            function () {
                return $filter('translate')('effective.advancedsearch.title');
            },
            function (newval) {
                eventbus.prepForBroadcast("title", newval);
            }
        );
        $scope.categories = [];
        $scope.groups = [];
        $scope.effective = [];
        $scope.effectiveSave = [];
        $scope.selection = [];
        $scope.filters = {
            birthdate: ''
        };
        var effectiveprom = $q.defer();
        $scope.effectiveprom = effectiveprom.promise;
        $scope.meta = meta;
        structureCfgRestAPI.getCategoriesAgeStrList($scope.meta.season.code, $scope.meta.structure._id).success(function (data) {
            $scope.categories = data;
            var found = false;
            data.forEach(function (b) {
                if ($scope.currentCategoryId === b.code) {
                    found = true;
                    $scope.currentCategory = b;
                } else {
                    b.listStaffMember.forEach(function (c) {
                        if (c.personId === $scope.user._id) {
                            $scope.currentCategory = b;
                            found = true;
                        }
                    });
                }
            });
            if (!found) {
                $scope.currentCategory = data[0];
            }
        });
        
        // return button
        $scope.doTheBack = function () {
            $window.history.back();
        };

        $scope.tableEffectives = new ngTableParams({
            page: 1, // show first page
            count: 25, // count per page
            filter: {},
            sorting: {
                name: 'asc' // initial sorting
            }
        }, {
            total: function () {
                return $scope.effective.length;
            },
            counts: [],
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')($scope.effective, params.orderBy()) : $scope.effective;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                $timeout(function () {
                    $.material.init();
                }, 500);
            }
        });

        $scope.getEffective = function () {
            effectiveRestAPI.getListMemberEffective($scope.meta.season.code, $scope.meta.structure._id, $scope.currentCategory.code).success(function (data) {
                var listId = [];
                data.forEach(function (a) {
                    listId = a.members;
                });
                
                var listField = new Array("_id", "name", "firstname", "avatar", "status" );
                
                /* retrieve person information */
                personRestAPI.getListPerson(listId, listField).success(function (data) {
                    data.forEach(function (e) {
                        if (angular.isDefined(e.status.positionType)) {
                            e.positionType = $filter('translate')('stat.positionType.value.' + e.status.positionType);
                        } else {
                            e.positionType = '';
                        }
                        e.birthdate = $filter('date')(e.birthdate, 'yyyy');
                        e.age = moment().format("YYYY") - e.birthdate;
                        e.weight = e.status.weight;
                        e.height = e.status.height;
                        if (angular.isDefined(e.status.laterality)) {
                            e.laterality = $filter('translate')('effective.advancedsearch.label.' + e.status.laterality);
                        } else {
                            e.laterality = '';
                        }
                        
                    });
                    $scope.effective = data;
                    $scope.effectiveSave = data;
                    effectiveprom.resolve(data);
                    $scope.tableEffectives.total(data.length);
                    $scope.tableEffectives.reload(); 
                });
            });
        };

        /* Retrieve All active group */
        $scope.$watch('currentCategory', function (newValue, oldValue) {
            if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                $scope.groups = [];
                groupAPI.getActiveGroupsCategory($scope.meta.structure._id, newValue.code).success(function (data) {
                    $scope.groups.add({
                        label: 'Tous',
                        _id: '-1'
                    });
                    data.forEach(function (a) {
                        $scope.groups.push(a);
                    });
                    var found = false;
                    $scope.groups.forEach(function (g) {
                        if (g._id === $scope.currentGroupId) {
                            $scope.currentGroup = g;
                            found = true;
                        }
                    });
                    if (!found) {
                        $scope.currentGroup = $scope.groups[0];
                    }
                    $scope.getEffective();
                    $location.url('/private/effective/advancedsearch/' + $scope.currentCategory.code + '/' + $scope.currentGroup._id);
                });
            }
        });

        /* Filter by group */
        $scope.$watch('currentGroup', function (newValue, oldValue) {
            if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                if (newValue._id !== '-1') {
                    $scope.groups.forEach(function (a) {
                        /* Select group */
                        if (a._id === newValue._id) {
                            var members = [];
                            /* loop on list person of the current group */
                            a.members.forEach(function (b) {
                                /* loop on effective list */
                                $scope.effectiveSave.forEach(function (c) {
                                    if (b === c._id) {
                                        members.push(c);
                                    }
                                });
                            });
                            /* refresh data */
                            effectiveprom.resolve(members);
                            $scope.effective = members;
                            $scope.tableEffectives.total(members.length);
                            $scope.tableEffectives.reload();
                            $location.url('/private/effective/advancedsearch/' + $scope.currentCategory.code + '/' + $scope.currentGroup._id);
                        }
                    });
                } else {
                    $scope.getEffective();
                    $location.url('/private/effective/advancedsearch/' + $scope.currentCategory.code + '/' + $scope.currentGroup._id);
                }
            }
        });
        $scope.displayPlayerSheet = function (id) {
            $location.path('/private/playersheet/' + id);
        };

        $scope.openCompareModal = function () {
            if ($scope.selection.length === 0) {
                toastr.warning($filter('translate')('effective.dashboard.selectionMin'));
            } else {
                $scope.players = [];
                $scope.effective.forEach(function (p) {
                    if ($scope.selection.find(p._id)) {
                        $scope.players.add(p);
                    }
                });
                $modal.open({
                    templateUrl: 'templates/prive/organization/effective/playerCompareModal.html',
                    controller: 'PlayerCompareCtrl',
                    size: 'lg',
                    resolve: {
                        players: function () {
                            return $scope.players;
                        },
                        meta: function () {
                            return $scope.meta;
                        }
                    }
                }).result.then(function () {
                        $scope.players = [];
                        $scope.selection = [];
                    }, function () {
                        $scope.players = [];
                        $scope.selection = [];
                    });
            }
        };
        $scope.toggleSelection = function toggleSelection(id) {
            var idx = $scope.selection.indexOf(id);
            // is currently selected
            if (idx > -1) {
                $scope.selection.splice(idx, 1);
            }
            // is newly selected
            else {
                // limit to 3 players
                if ($scope.selection.length === 3) {
                    angular.element("#check-" + id).attr("checked", false);
                    toastr.warning($filter('translate')('effective.dashboard.selectionLimit'));
                } else {
                    $scope.selection.push(id);
                }
            }
        };

        $scope.showSimpleSearch = function () {
            $location.path('/private/effective/search/' + $scope.currentCategory.code + '/' + $scope.currentGroup._id);
        };
    })
//
;
