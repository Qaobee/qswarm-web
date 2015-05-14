/**
 * Module that shows the effective
 *
 * @author Christophe Kervella / Xavier Marin
 * @class qaobee.prive.organization.effective
 * @namespace qaobee.prive.organization.effective
 *
 * @copyright <b>QaoBee</b>.
 */
angular.module('effectiveMod',
    ['common-config', 'labelsAPI', 'structureCfgRestAPI', 'summarysheet', 'effectiveRestAPI', 'ngTable', 'ngTableExport',
        'statWidget', 'userMetaAPI', 'staffListWidget', 'unavailableEffectiveWidget', 'palmaresEffectiveWidget',
        'profileRestAPI', 'groupAPI', 'labelsAPI', 'statAPI', 'activityCfgRestAPI' ,'effectiveSearch', 'locationAPI', 'ui.utils', 'personRestAPI'])
//      ,'ui.select'

    .config(function ($routeProvider, metaDatasProvider) {
        'use strict';
        $routeProvider.when('/private/effective/dashboard/:currentCategory/:currentGroup', {
            controller: 'DashboardCtrl', reloadOnSearch: false,
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'templates/prive/organization/effective/dashboard.html'
        }).when('/private/effective/player/add', {
            controller: 'AddPlayerCtrl',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'templates/prive/organization/effective/addPlayer.html'
        });
    })
/**
 * @class qaobee.prive.organization.effective.DashboardCtrl
 * @description Controller of templates/prive/organization/effective/dashboard.html
 */
    .controller('DashboardCtrl', function ($log, $route, $routeParams, $scope, $rootScope, $timeout, $modal, personRestAPI, structureCfgRestAPI, eventbus, groupAPI, effectiveRestAPI, statAPI, profileRestAPI, $q, ngTableParams, $filter, $location, $translatePartialLoader, user, meta) {
        var lastRoute = $route.current;
        $scope.user = user;
        $scope.meta = meta;
        $scope.isGraphsCollapsed = false;
        $scope.isMoreDataCollapsed = true;
        eventbus.prepForBroadcast("left-menu", 'effective.dashboard');
        $scope.$on('$locationChangeSuccess', function () {
            if (lastRoute.$$route.originalPath === $route.current.$$route.originalPath) {
                $route.current = lastRoute;
            }
        });
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('stats');
        $translatePartialLoader.addPart('widgets');
        $scope.currentCategoryId = $routeParams.currentCategory;
        $scope.currentGroupId = $routeParams.currentGroup;
        $scope.$watch(
            function () {
                return $filter('translate')('effective.dashboard.maintitle');
            },
            function (newval) {
                eventbus.prepForBroadcast("title", newval);
            }
        );
        $scope.prefloaded = false;
        $scope.ownersId = $q.defer();
        // Retrieve categories
        $scope.categories = [];
        $scope.groups = [];
        $scope.effective = [];
        $scope.effectiveSave = [];
        $scope.selection = [];

        var effectiveprom = $q.defer();
        $scope.effectiveprom = effectiveprom.promise;

        $scope.userparams = {
            0: {
                type: 'Line',
                color: 'muted',
                height: 120,
                stat: ['attendance'],
                aggregat: 'AVG',
                listFieldsGroupBy: ['code', 'timer'],
                listFieldsSortBy: [{"fieldName": "_id.timer", "sortOrder": -1}],
                limitResult : 5,
                inverseSort : true
            },
            1: {
                type: 'Doughnut',
                color: 'muted',
                height: 120,
                stat: ['positionType'],
                aggregat: 'COUNT',
                listFieldsGroupBy: ['code', 'value']
            },
            2: {
                color: 'muted',
                height: 350
            },
            3: {
                color: 'muted',
                type: 'Radar',
                height: 250,
                stat: ['stateForm'],
                aggregat: 'COUNT',
                listFieldsGroupBy: ['code', 'value']
            }
        };

        /* Retrieve list of category for structure */
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
            fetchGroups();
        });

        $scope.buildData = function (param) {
            param.prom = $scope.ownersId.promise;
            return param;
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


        /* initialize effective table */
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
        
        function fetchGroups() {

            groupAPI.getActiveGroupsCategory($scope.meta.structure._id, $scope.currentCategory.code).success(function (data) {
                $scope.groups = [];
                $scope.groups.add({
                    label: 'Tous',
                    _id: '-1'
                });
                $scope.currentGroup = $scope.groups[0];
                data.forEach(function (a) {
                    $scope.groups.push(a);
                });
                var found = false;
                $scope.groups.forEach(function (g) {
                    if (g._id === $scope.currentGroupId) {
                        found = true;
                    }
                });
                $scope.players = [];
                $scope.selection = [];
                $scope.getEffective(true);
                $location.url('/private/effective/dashboard/' + $scope.currentCategory.code + '/' + $scope.currentGroup._id);
            });

        }

        /* Reload active group on change category */
        $scope.$watch('currentCategory', function (newValue, oldValue) {
            if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                $scope.groups = [];
                fetchGroups();
            }
        });

        /* Filter effective table on change group */
        $scope.$watch('currentGroup', function (newValue, oldValue) {
            if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                if (newValue._id !== '-1') {
                    $scope.groups.forEach(function (a) {
                        /* Select group */
                        if (a._id === newValue._id) {
                            var members = [];
                            var ownersId = [];
                            /* loop on list person of the current group */
                            a.members.forEach(function (b) {
                                /* loop on effective list */
                                $scope.effectiveSave.forEach(function (c) {
                                    if (b === c._id) {
                                        members.push(c);
                                        ownersId.push(c._id);
                                    }
                                });
                            });
                            $scope.players = [];
                            $scope.selection = [];
                            /* refresh data */
                            $scope.ownersId.resolve(ownersId);
                            effectiveprom.resolve(members);
                            eventbus.prepForBroadcast("ownersId", ownersId);
                            $scope.effective = members;
                            $scope.tableEffectives.total(members.length);
                            $scope.tableEffectives.reload();
                            $location.url('/private/effective/dashboard/' + $scope.currentCategory.code + '/' + $scope.currentGroup._id);
                        }
                    });
                } else {
                    $scope.players = [];
                    $scope.selection = [];
                    $scope.getEffective(true);
                    $location.url('/private/effective/dashboard/' + $scope.currentCategory.code + '/' + $scope.currentGroup._id);
                }
            }
        });


        /* Retrieve members of effective*/
        $scope.getEffective = function (refreshGraphs) {
            effectiveRestAPI.getListMemberEffective($scope.meta.season.code, $scope.meta.structure._id, $scope.currentCategory.code).success(function (data) {
                
                var listId = [];
                data.forEach(function (a) {
                    listId = a.members;
                });
                
                var listField = new Array("_id", "name", "firstname", "avatar", "status", "physicalFolder", "technicalFolder", "mentalFolder" );
                
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
                    var ownersId = [];
                    data.forEach(function (a) {
                        a.stats = {holder: 0, substitue: 0, playtime: 0};
                        ownersId.push(a._id);
                    });
                    $scope.ownersId.resolve(ownersId);
                    if (refreshGraphs) {
                        eventbus.prepForBroadcast("ownersId", ownersId);
                    }
                    $scope.tableEffectives.total(data.length);
                    $scope.tableEffectives.reload();
                    var search = {
                        listIndicators: ['holder', 'substitue'],
                        listOwners: ownersId,
                        startDate: $scope.meta.season.startDate,
                        endDate: $scope.meta.season.endDate,
                        aggregat: 'COUNT',
                        listFieldsGroupBy: ['owner', 'code']
                    };

                    statAPI.getStatGroupBy(search).success(function (data) {
                        if (angular.isUndefined(data) || data === null) {
                            return;
                        }
                        data.forEach(function (a) {
                            var i = $scope.effective.findIndex(function (n) {
                                return n._id === a._id.owner;
                            });
                            if (a._id.code === 'holder') {
                                $scope.effective[i].stats.holder = a.value;
                            } else {
                                $scope.effective[i].stats.substitue = a.value;
                            }
                        });
                    });
                    
                    //Add playtime in table effective
                    search = {
                        listIndicators: ['playtime'],
                        listOwners: ownersId,
                        startDate: $scope.meta.season.startDate,
                        endDate: $scope.meta.season.endDate,
                        aggregat: 'SUM',
                        listFieldsGroupBy: ['owner', 'code']
                    };
                    
                    statAPI.getStatGroupBy(search).success(function (data) {
                        if (angular.isUndefined(data) || data === null) {
                            return;
                        }
                        data.forEach(function (a) {
                            var i = $scope.effective.findIndex(function (n) {
                                return n._id === a._id.owner;
                            });
                            $scope.effective[i].stats.playtime = a.value;
                            
                        });
                    });

                    $scope.effectiveSave = $scope.effective;
                    
                });
            });
        };

        $scope.displayPlayerSheet = function (id) {
            $location.path('/private/playersheet/' + id);
        };

        //

    }
)
/**
 * @class qaobee.prive.organization.effective.PlayerCompareCtrl
 * @description Controller of the modal templates/prive/organization/effective/playerCompareModal.html
 */
    .controller('PlayerCompareCtrl', function ($scope, $modalInstance, players, meta, $log, $filter, $translatePartialLoader, statAPI) {
        $scope.players = players;
        $scope.meta = meta;
        var mouse = {x: 0, y: 0, offset: 0};

        $scope.getMousePos = function (event) {
            mouse.x = event.pageX;
            mouse.y = event.pageY;
            mouse.offset = $(window).scrollTop();
        };
        var indicators = Array.create('playtime', 'goalscored', 'holder', 'substitue');
        var colours = Array.create("#03A9F4", "#0F9D58", "#FF5722");
        $scope.colours = [];
        $scope.rgbaColors = Array.create({
            fillColor: "rgba(3, 169, 244, 0.2)",
            strokeColor: "rgba(3, 169, 244, 1)",
            pointColor: "rgba(3, 169, 244, 1)",

            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(3, 169, 244, 0.8)"
        }, {
            fillColor: "rgba(15, 157, 88, 0.2)",
            strokeColor: "rgba(15, 157, 88, 1)",
            pointColor: "rgba(15, 157, 88, 1)",

            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(15, 157, 88, 0.8)"
        }, {
            fillColor: "rgba(255, 87, 34, 0.2)",
            strokeColor: "rgba(255, 87, 34, 1)",
            pointColor: "rgba(255, 87, 34, 1)",

            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(255, 87, 34, 0.8)"
        });


        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        $scope.myRadarChart = {
            options: {
                scaleFontSize: 0,
                tooltipFontSize: 10,
                tooltipTitleFontSize: 10,
                maintainAspectRatio: false,
                animationEasing: "easeOutQuart",
                pointLabelFontSize: 0,
                customTooltips: function (tooltip) {

                    var tooltipEl = $('#chartjs-tooltip');
                    if (!tooltip) {
                        tooltipEl.css({
                            opacity: 0
                        });
                        return;
                    }
                    tooltipEl.removeClass('above below');
                    tooltipEl.addClass(tooltip.yAlign);
                    var innerHtml = '<b>' + tooltip.title + '</b>';
                    for (var i = tooltip.labels.length - 1; i >= 0; i--) {
                        innerHtml += [
                            '<div class="chartjs-tooltip-section">',
                            '	<span class="chartjs-tooltip-key" style="background-color:' + tooltip.legendColors[i].fill + '"></span>',
                            '	<span class="chartjs-tooltip-value">' + tooltip.labels[i] + '</span>',
                            '</div>'
                        ].join('');
                    }
                    tooltipEl.html(innerHtml);
                    tooltipEl.css({
                        opacity: 1,
                        left: (mouse.x + 40 - angular.element("#playerCompareModal")[0].parentElement.parentElement.offsetLeft) + 'px',
                        top: (mouse.y - mouse.offset + angular.element("#playerCompareModal")[0].parentElement.parentElement.offsetParent.scrollTop) + 'px',
                        fontFamily: tooltip.fontFamily,
                        fontSize: tooltip.fontSize,
                        fontStyle: tooltip.fontStyle
                    });
                }
            },
            data: {
                labels: [],
                series: [],
                datasets: [[]]
            }
        };
        $scope.myChart = {
            options: {
                scaleFontSize: 10,
                tooltipFontSize: 10,
                tooltipTitleFontSize: 10,
                maintainAspectRatio: false,
                animationEasing: "easeOutQuart",
                pointLabelFontSize: 0,
                customTooltips: function (tooltip) {

                    var tooltipEl = $('#chartjs-tooltip');
                    if (!tooltip) {
                        tooltipEl.css({
                            opacity: 0
                        });
                        return;
                    }
                    tooltipEl.removeClass('above below');
                    tooltipEl.addClass(tooltip.yAlign);
                    var innerHtml = '<b>' + tooltip.title + '</b>';
                    for (var i = tooltip.labels.length - 1; i >= 0; i--) {
                        innerHtml += [
                            '<div class="chartjs-tooltip-section">',
                            '	<span class="chartjs-tooltip-key" style="background-color:' + tooltip.legendColors[i].fill + '"></span>',
                            '	<span class="chartjs-tooltip-value">' + tooltip.labels[i] + '</span>',
                            '</div>'
                        ].join('');
                    }
                    tooltipEl.html(innerHtml);
                    tooltipEl.css({
                        opacity: 1,
                        left: (mouse.x + 40 - angular.element("#playerCompareModal")[0].parentElement.parentElement.offsetLeft) + 'px',
                        top: (mouse.y - mouse.offset + angular.element("#playerCompareModal")[0].parentElement.parentElement.offsetParent.scrollTop) + 'px',
                        fontFamily: tooltip.fontFamily,
                        fontSize: tooltip.fontSize,
                        fontStyle: tooltip.fontStyle
                    });
                }
            },
            data: {
                labels: [],
                series: [],
                datasets: [[]]
            }
        };
        $scope.attendanceOptions = angular.copy($scope.myChart.options);
        $scope.attendanceOptions.scaleOverride = true;
        $scope.attendanceOptions.scaleStartValue = 0;
        $scope.attendanceOptions.scaleStepWidth = 20;
        $scope.attendanceOptions.scaleSteps = 5;
        $scope.technicalRadar = {
            datasets: [],
            series: [],
            labels: []
        };
        $scope.physicalRadar = {
            datasets: [],
            series: [],
            labels: []
        };
        $scope.mentalRadar = {
            datasets: [],
            series: [],
            labels: []
        };
        $scope.goals = {
            datasets: [],
            labels: []
        };
        $scope.playtime = {
            datasets: [],
            labels: []
        };
        $scope.attendance = {
            datasets: [],
            labels: []
        };
        var serie = 0;
        $scope.stats = [];
        $scope.players.forEach(function () {
            $scope.goals.datasets.push([0]);
            $scope.goals.labels.push('');
            $scope.playtime.datasets.push([0]);
            $scope.playtime.labels.push('');
            $scope.attendance.datasets.push([0]);
            $scope.attendance.labels.push('');
        });
        $scope.players.forEach(function (p) {
            var playtimeCount = 0;
            $scope.stats[p._id] = [];
            $scope.colours[p._id] = colours[serie];
            angular.forEach(indicators, function (value) {
                $scope.stats[p._id][value] = {sum: 0, avg: 0, count: 0, freq: 0};
            });
            $scope.stats[p._id].attendance = {sum: 0, avg: 0, count: 0, freq: 0};

            $scope.myChart.data.series.push(p.firstname + ' ' + p.name);
            $scope.technicalRadar.datasets.push([]);
            $scope.physicalRadar.datasets.push([]);
            $scope.mentalRadar.datasets.push([]);
            p.technicalFolder.forEach(function (a) {
                if (serie === 0) {
                    $scope.technicalRadar.labels.push($filter('translate')('playerSheet.rubrics.technical.label.' + a.key));
                }
                $scope.technicalRadar.datasets[serie].push(a.value);
            });
            p.physicalFolder.forEach(function (a) {
                if (serie === 0) {
                    $scope.physicalRadar.labels.push($filter('translate')('playerSheet.rubrics.physical.label.' + a.key));
                }
                $scope.physicalRadar.datasets[serie].push(a.value);

            });
            p.mentalFolder.forEach(function (a) {
                if (serie === 0) {
                    $scope.mentalRadar.labels.push($filter('translate')('playerSheet.rubrics.mental.label.' + a.key));
                }
                $scope.mentalRadar.datasets[serie].push(a.value);
            });
            var search = {
                listIndicators: indicators,
                listOwners: [p._id],
                startDate: $scope.meta.season.startDate,
                endDate: $scope.meta.season.endDate,
                aggregat: "AVG",
                listFieldsGroupBy: ['code'],
                serie: serie
            };
            statAPI.getStatGroupBy(search).success(function (data, status, headers, config) {
                if (angular.isArray(data) && data.length > 0) {
                    angular.forEach(data, function (value) {
                        $scope.stats[config.data.listOwners[0]][value._id.code].avg = value.value;
                    });
                }
                var searchSum = angular.copy(config.data);
                searchSum.aggregat = "SUM";
                statAPI.getStatGroupBy(searchSum).success(function (data, status, headers, config) {
                    if (angular.isArray(data) && data.length > 0) {
                        angular.forEach(data, function (value) {
                            $scope.stats[config.data.listOwners[0]][value._id.code].sum = value.value;
                            if (value._id.code === 'playtime') {
                                playtimeCount = parseFloat(value.value);
                            }
                        });
                    }
                    var searchCount = angular.copy(config.data);
                    searchCount.aggregat = "COUNT";
                    statAPI.getStatGroupBy(searchCount).success(function (data, status, headers, config) {
                        if (angular.isArray(data) && data.length > 0) {
                            angular.forEach(data, function (value) {
                                $scope.stats[config.data.listOwners[0]][value._id.code].count = value.value;
                                $scope.stats[config.data.listOwners[0]][value._id.code].freq = playtimeCount / value.value;
                            });
                            $scope.goals.datasets[config.data.serie] = [$scope.stats[config.data.listOwners[0]].goalscored.sum];
                            $scope.playtime.datasets[config.data.serie] = [$scope.stats[config.data.listOwners[0]].playtime.sum];
                        }
                        var searchAttendance = angular.copy(config.data);
                        searchAttendance.listIndicators = ['attendance'];
                        searchAttendance.aggregat = "AVG";
                        searchAttendance.value = $filter('translate')('stat.attendance.val');
                        statAPI.getStatGroupBy(searchAttendance).success(function (data, status, headers, config) {
                            if (angular.isArray(data) && data.length > 0) {
                                angular.forEach(data, function (value) {
                                    $scope.stats[config.data.listOwners[0]][value._id.code].avg = value.value;
                                });
                                $scope.attendance.datasets[config.data.serie] = [parseFloat($filter('number')($scope.stats[config.data.listOwners[0]].attendance.avg * 100, 2))];
                            }
                        });
                    });
                });
            });
            serie++;
        });
    })

/**
 * @class qaobee.prive.organization.effective.AddPlayerCtrl
 * @description Controller of templates/prive/organization/effective/addPlayer.html
 */
    .controller('AddPlayerCtrl', function ($log, labelsAPI, $rootScope, structureCfgRestAPI, $scope, $location, $filter, locationAPI, activityCfgRestAPI, $translatePartialLoader, statAPI, personRestAPI, effectiveRestAPI, eventbus, user, meta) {
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('format');
        $translatePartialLoader.addPart('data');
        $translatePartialLoader.addPart('main');
        $translatePartialLoader.addPart('stats');
        $scope.$watch(
            function () {
                return $filter('translate')('effective.addPlayer.maintitle');
            },
            function (newval) {
                eventbus.prepForBroadcast("title", newval);
            }
        );
        $scope.newPlayer = {
            status: {
                squadnumber: 0, availability: {
                    value: "available",
                    cause: "available"
                },
                weight: 0,
                height: 0,
                laterality: "right-footed",
                stateForm: "good"
            }, address: {}, contact: {}
        };
        $scope.licence = {};
        $scope.birthcityFormatedAddress = '';

        $scope.dateOption = {
            minDate: new Date(1900, 0, 1, 1, 0, 1),
            maxDate: new Date()
        };
        $scope.dateOption2 = {
            minDate: new Date(1900, 0, 1, 1, 0, 1),
            maxDate: new Date(2999, 0, 0, 0, 0, 0)
        };
        $scope.dateOption3 = {
            minDate: new Date(1900, 0, 1, 1, 0, 1),
            maxDate: new Date(2999, 0, 0, 0, 0, 0)
        };
        labelsAPI.getListe('countries').success(function (data) {
            $scope.countriesList = data;
        });

        activityCfgRestAPI.getGenderList(moment().valueOf(), meta.season.code, meta.activity.code, meta.structure.country._id).success(function (data) {
            $scope.genders = data;
        });
        $scope.translated = function (p) {
            return $filter('translate')(p.label);
        };

        $scope.getBirthcity = function () {
            if (angular.isDefined($scope.newPlayer.birthcity) && !$scope.newPlayer.birthcity.isBlank()) {
                locationAPI.get($scope.newPlayer.birthcity).then(function (adr) {
                    // parsing des infos
                    angular.forEach(adr.data.results[0].address_components, function (item) {
                        if (item.types.count('locality') > 0) {
                            $scope.newPlayer.birthcity = item.long_name;
                        }
                    });
                });
            }
        };
        
        $scope.address = {};
        $scope.refreshAddresses = function(address) {
          var params = {address: address, sensor: false};
          return $http.get(
            'http://maps.googleapis.com/maps/api/geocode/json',
            {params: params}
          ).then(function(response) {
            $scope.addresses = response.data.results;
          });
        };
        

        $scope.getPostalAddress = function () {
            if (angular.isDefined($scope.newPlayer.address.formatedAddress) && !$scope.newPlayer.address.formatedAddress.isBlank()) {
                locationAPI.get($scope.newPlayer.address.formatedAddress).then(function (adr) {
                    $scope.newPlayer.address.lat = adr.data.results[0].geometry.location.lat;
                    $scope.newPlayer.address.lng = adr.data.results[0].geometry.location.lng;
                    angular.forEach(adr.data.results[0].address_components, function (item) {
                        if (item.types.count('street_number') > 0) {
                            $scope.newPlayer.address.place = item.long_name + ' ';
                        }
                        if (item.types.count('route') > 0) {
                            $scope.newPlayer.address.place += item.long_name;
                        }
                        if (item.types.count('locality') > 0) {
                            $scope.newPlayer.address.city = item.long_name;
                        }
                        if (item.types.count('postal_code') > 0) {
                            $scope.newPlayer.address.zipcode = item.long_name;
                        }
                        if (item.types.count('country') > 0) {
                            $scope.newPlayer.address.country = item.long_name;
                        }
                    });
                });
            }
        };

        $scope.upsertPlayer = function () {
            $scope.newPlayer.birthdate = $scope.dateOption.val;
            $scope.licence.dateInscription = $scope.dateOption2.val;
            $scope.licence.dateQualification = $scope.dateOption3.val;
            $scope.newPlayer.name = $scope.newPlayer.name.capitalize(true);
            $scope.newPlayer.firstname = $scope.newPlayer.firstname.capitalize(true);
            $scope.newPlayer.listLicenses = Array.create({
                numLicense: $scope.licencenumber,
                structureId: $scope.structure._id,
                listHistoLicense: Array.create($scope.licence)
            });
            addPerson();
        };

        function addPerson() {
            var dataContainer = {
                person: $scope.newPlayer,
                countryId: meta.structure.country._id,
                activityId: meta.activity.code
            };

            personRestAPI.addPerson(dataContainer).success(function (person) {
                
                /* add person in effective*/
                effectiveRestAPI.getListMemberEffective($scope.meta.season.code, $scope.meta.structure._id, person.listLicenses[0].listHistoLicense[0].categoryAgeCode).success(function (effective) {
                        
                    if(angular.isDefined(effective[0])){
                        effective[0].members.push(person._id);
                        effectiveRestAPI.update(effective[0]).success(function (data) {
                            var cat = '';
                            $scope.categories.forEach(function (c) {
                                if (c.code === person.listLicenses[0].listHistoLicense[0].categoryAgeCode) {
                                    cat = c.label;
                                }
                            });
                            toastr.success($filter('translate')('effective.addPlayer.success', {
                                firstname: person.firstname,
                                name: person.name,
                                cat: cat
                            }));
                            $location.path('private/effective/dashboard/' + $scope.licence.categoryAgeCode + '/-1'); 
                        });
                    } else {
                        /* Effective not found so create new effective with new person as member */
                        
                        var cat = '';
                        var category = {};
                        activityCfgRestAPI.getCategoriesAgeList(moment().valueOf(), meta.activity.code, meta.structure.country._id).success(function(ageCategories) {
                            
                            ageCategories.forEach(function (c) {
                                if (c.code === person.listLicenses[0].listHistoLicense[0].categoryAgeCode) {
                                    cat = c.label;
                                    category = c;
                                }
                            });
                            
                            var newEffective = {
                                "_id" : null,
                                "structureId" : $scope.meta.structure._id,
                                "seasonCode" : $scope.meta.season.code,
                                "categoryAge" : category,
                                "members" : [person._id]
                            };
                            $log.log(newEffective);
                            
                            effectiveRestAPI.add(newEffective).success(function (data) {
                                
                                toastr.success($filter('translate')('effective.addPlayer.success', {
                                    firstname: person.firstname,
                                    name: person.name,
                                    cat: cat
                                }));
                                $location.path('private/effective/dashboard/' + $scope.licence.categoryAgeCode + '/-1'); 
                            }); 
                        });
                    }
                });
            });
        }

        $scope.dateInscription = moment(moment().valueOf()).format($filter('translate')('date.format'));
        $scope.dateQualification = moment(moment().valueOf()).format($filter('translate')('date.format'));
        $scope.season = meta.season;
        $scope.activity = meta.activity;
        $scope.structure = meta.structure;
        $scope.licence.seasonCode = $scope.season.code;
        structureCfgRestAPI.getCategoriesAgeStrList(meta.season.code, meta.structure._id).success(function (data) {
            $scope.categories = data;
        });
        var search = {
            activityId: meta.activity._id,
            countryId: meta.structure.country._id,
            listIndicators: ['positionType', 'stateForm', 'laterality']
        };
        statAPI.getIndicatorCfg(search).success(function (data) {
            if (angular.isUndefined(data) || data === null) {
                return;
            }
            data.forEach(function (d) {
                $scope[d.code] = d.listValues;
            });
        });
        activityCfgRestAPI.getLicenseTypeList(moment().valueOf(), meta.season.code, meta.activity.code, meta.structure.country._id).success(function (data) {
            $scope.typeLicences = data;

        });
        /**
         * @name $scope.getLocation
         * @function
         * @memberOf qaobee.prive.organization.effective.AddPlayerCtrl
         * @description Get formated address from Google
         * @see {@link https://developers.google.com/maps/documentation/geocoding/}
         */
        $scope.getLocation = function (val) {
            return locationAPI.get(val).then(function (res) {
                var addresses = Array.create();
                angular.forEach(res.data.results, function (item) {
                    addresses.push(item.formatted_address);
                });
                return addresses;
            });
        };
    }
)
;
