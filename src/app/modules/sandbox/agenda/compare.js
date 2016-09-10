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

        .factory('eventCompareService', function () {
            var compareList = [];
            return {
                get: function () {
                    return compareList;
                },
                add: function (pId) {
                    compareList.push(pId);
                },
                remove: function (pId) {
                    compareList.remove(pId);
                },
                init: function () {
                    compareList = [];
                }
            };
        })

        .controller('CompareEventsController', function ($scope, $routeParams, $translatePartialLoader, $log, $q, $filter, eventsRestAPI, statsRestAPI, eventCompareService, user, meta, $window, qeventbus) {
            $scope.loading = true;
            $scope.events = [];
            $scope.meta = meta;
            $scope.series = [];
            $scope.effectiveId = $routeParams.effectiveId;
            $scope.eventsIds = eventCompareService.get() || [];
            $scope.periodicity = $scope.periodicity || 'season';
            $scope.periodicityActive = $scope.periodicityActive || {
                    label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                    startDate: moment($scope.meta.season.startDate),
                    endDate: moment($scope.meta.season.endDate),
                    ownersId: $scope.ownersId
                };
            $scope.periodicityActive.ownersId = $scope.periodicityActive.ownersId || $scope.ownersId;
            $scope.$watch('periodicityActive', function (newValue, oldValue) {
                if (!angular.equals(oldValue, newValue)) {
                    $scope.periodicityActive = newValue;
                    qeventbus.prepForBroadcast('periodicityActive', {
                        periodicityActive: newValue,
                        periodicity: $scope.periodicity
                    });
                    $scope.buildWidget();
                }
            });


            $scope.doTheBack = function () {
                $window.history.back();
            };

            $scope.buildWidget = function () {
                if (eventCompareService.get() > 0) {
                    getEvents(eventCompareService.get(), function (data) {
                        if (data.error) {
                            return;
                        }
                        $scope.events = data;
                        $scope.series = $scope.events.map(function (p) {
                            return p.label || p.type.label + ' ' + moment(p.startDate).format('LLLL');
                        });
                        $scope.eventsIds = $scope.events.map(function (p) {
                            return p._id;
                        });
                        $scope.buildWidget();
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
                var listFieldsGroupBy = Array.create('code');
                var promises = [];
                var startDate = $scope.periodicityActive.startDate.valueOf();
                var endDate = $scope.periodicityActive.endDate.valueOf();
                $scope.eventsIds.forEach(function (id) {
                    promises.push(statsRestAPI.getStatGroupBy({
                        listIndicators: Array.create('goalScored', 'goalConceded'),
                        listOwners: Array.create(id),
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
                        listIndicators: Array.create('originShootAtt', 'originShootDef'),
                        listOwners: Array.create(id),
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
                        listIndicators: Array.create('yellowCard', 'exclTmp', 'redCard'),
                        listOwners: Array.create(id),
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
                            if (eventsIds.any(t._id)) {
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

            $scope.buildWidget();
        });
})
();

