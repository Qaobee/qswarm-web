(function () {
    'use strict';
    angular.module('qaobee.compare.events', [
        'effectifSRV',
        'eventsRestAPI',
        'statsRestAPI',
        'qaobee.commonsConfig'
    ])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/agenda/compare/:effectiveId', {
                controller: 'CompareEventsController',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/agenda/compare.html'
            });
        })

        .factory('eventCompareService', function ($window) {
            var compareList = [];
            return {
                get: function () {
                    return $window.sessionStorage.eventCompareList ? JSON.parse($window.sessionStorage.teamCompareList) : compareList;
                },
                add: function (pId) {
                    compareList.push(pId);
                    $window.sessionStorage.eventCompareList = JSON.stringify(compareList);
                },
                remove: function (pId) {
                    compareList.remove(pId);
                    $window.sessionStorage.eventCompareList = JSON.stringify(compareList);
                },
                init: function () {
                    compareList = [];
                }
            };
        })

        .controller('CompareEventsController', function ($scope, $routeParams, $translatePartialLoader, $q, eventsRestAPI,
                                                         statsRestAPI, eventCompareService, user, meta, $window, qeventbus) {
            $scope.loading = true;
            $scope.events = [];
            $scope.meta = meta;
            $scope.series = [];
            $scope.effectiveId = $routeParams.effectiveId;
            $scope.eventsIds = eventCompareService.get() || [];

            $scope.doTheBack = function () {
                $window.history.back();
            };

            $scope.buildWidget = function () {
                if ($scope.eventsIds.length > 0) {
                    getEvents($scope.eventsIds, function (data) {
                        if (data.error) {
                            return;
                        }
                        $scope.events = data;
                        $scope.series = $scope.events.map(function (p) {
                            return p.label || p.type.label + ' ' + moment(p.startDate).format('LLLL');
                        });
                        qeventbus.prepForBroadcast('ownersId', {
                            ownersId: $scope.eventsIds
                        });
                    });
                } else {
                    $scope.loading = false;
                }
                $scope.stats = {
                    goals: {},
                    sanctions: {},
                    originShoot: {}
                };
                if ($scope.eventsIds.length === 0) {
                    $scope.loading = false;
                    return;
                }
                var listFieldsGroupBy = ['code'];
                var promises = [];
                var startDate = $scope.periodicityActive.startDate.valueOf();
                var endDate = $scope.periodicityActive.endDate.valueOf();
                qeventbus.prepForBroadcast('ownersId', {
                    ownersId: $scope.eventsIds
                });
                $scope.eventsIds.forEach(function (id) {
                    promises.push(statsRestAPI.getStatGroupBy({
                        listIndicators: ['goalScored', 'goalConceded'],
                        listOwners: [id],
                        startDate: startDate.valueOf(),
                        endDate: endDate.valueOf(),
                        aggregat: 'COUNT',
                        listFieldsGroupBy: listFieldsGroupBy
                    }).then(function (data) {
                        if (angular.isArray(data.data) && data.data.length > 0) {
                            data.data.forEach(function (a) {
                                $scope.stats.goals[data.config.data.listOwners[0]] = a.value;
                            });
                        }
                    }));
                    promises.push(statsRestAPI.getStatGroupBy({
                        listIndicators: ['originShootAtt', 'originShootDef'],
                        listOwners: [id],
                        startDate: startDate.valueOf(),
                        endDate: endDate.valueOf(),
                        aggregat: 'COUNT',
                        listFieldsGroupBy: listFieldsGroupBy
                    }).then(function (data) {
                        if (angular.isArray(data.data) && data.data.length > 0) {
                            data.data.forEach(function (a) {
                                $scope.stats.originShoot[data.config.data.listOwners[0]] = a.value;
                            });
                        }
                    }));
                    promises.push(statsRestAPI.getStatGroupBy({
                        listIndicators: ['yellowCard', 'exclTmp', 'redCard'],
                        listOwners: [id],
                        startDate: startDate.valueOf(),
                        endDate: endDate.valueOf(),
                        aggregat: 'COUNT',
                        listFieldsGroupBy: listFieldsGroupBy
                    }).then(function (data) {
                        if (angular.isArray(data.data) && data.data.length > 0) {
                            data.data.forEach(function (a) {
                                $scope.stats.sanctions[data.config.data.listOwners[0]] = a.value;
                            });
                        }
                    }));
                });
                $q.all(promises).then(function () {
                    $scope.loading = false;
                });
            };

            /* Retrieve current effective and list player */
            function getEvents(eventsIds, callback) {
                var requestEvent = {
                    activityId: $scope.meta.sandbox.activity._id,
                    startDate: $scope.periodicityActive.startDate.valueOf(),
                    endDate: $scope.periodicityActive.endDate.valueOf(),
                    ownersandboxId: $scope.meta.sandbox._id,
                    ownereffectiveId: $scope.effectiveId,
                    type: ['cup', 'friendlyGame', 'championship', 'training']
                };

                eventsRestAPI.getListEvents(requestEvent).then(function (data) {
                    if (angular.isArray(data.data) && data.data.length > 0) {
                        var events = [];
                        data.data.forEach(function (t) {
                            if (eventsIds.some(t._id)) {
                                events.push(t);
                            }
                        });
                        events = events.sortBy(function (n) {
                            return n.startDate;
                        });

                        events.forEach(function (a) {
                            a.startDate = moment(a.startDate).format('LLLL');
                        });
                        callback(events);
                    } else {
                        callback([]);
                    }
                });
            }

            $scope.$on('qeventbus:periodicityActive', function () {
                if (!$scope.periodicityActive || !angular.equals($scope.periodicityActive, qeventbus.data.periodicityActive)) {
                    $scope.periodicityActive = qeventbus.data.periodicityActive;
                    $scope.buildWidget();
                }
            });
            $scope.buildWidget();
        });
})();