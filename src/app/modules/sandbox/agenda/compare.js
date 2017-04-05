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
                    return $window.sessionStorage.eventCompareList ? JSON.parse($window.sessionStorage.eventCompareList) : compareList;
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
                $scope.series = [];
                $scope.events = [];
                if ($scope.eventsIds.length > 0) {
                    $scope.eventsIds.forEach(function (e) {
                        eventsRestAPI.getEvent(e).then(function (evt) {
                            $scope.events.push(evt.data);
                            $scope.series.push(evt.data.label || evt.data.type.label + ' ' + moment(evt.data.startDate).format('LLLL'));
                        });
                    });
                } else {
                    $scope.loading = false;
                }
                if (angular.isUndefined($scope.periodicityActive) || angular.isUndefined($scope.eventsIds)) {
                    return;
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
                    qeventbus.prepForBroadcast('ownersId', {
                        ownersId: $scope.eventsIds
                    });
                });
            };

            $scope.$on('qeventbus:periodicityActive', function () {
                if (angular.isDefined(qeventbus.data.periodicityActive) && !angular.equals(qeventbus.data.periodicityActive, $scope.periodicityActive)) {
                    $scope.periodicityActive = angular.copy(qeventbus.data.periodicityActive);
                    $scope.buildWidget();
                }
            });
            $scope.buildWidget();
        });
})();