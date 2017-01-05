(function () {
    'use strict';
    /**
     * Created by cke on 22/12/15.
     *
     * calendar filter directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */
    angular.module('qaobee.filterCalendar', ['qaobee.eventbus'])
        .factory('filterCalendarSrv', function () {
            return {
                getDefault: function (startDate, endDate) {
                    return {
                        label: moment(startDate, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment(endDate, 'DD/MM/YYYY').format('MMMM YYYY'),
                        startDate: startDate,
                        endDate: endDate
                    };
                },
                getMonth: function (startDate, endDate) {
                    return {
                        label: moment(startDate, 'DD/MM/YYYY').format('MMMM YYYY'),
                        startDate: startDate,
                        endDate: endDate
                    };
                },
                calculateMonth: function (currentQuarter) {
                    return ((currentQuarter - 1) * 3 + 1).padLeft(2);
                }
            };
        })
        .directive('filterCalendar', function ($translatePartialLoader, qeventbus, filterCalendarSrv) {
            return {
                restrict: 'E',
                scope: {
                    meta: "=",
                    popup: "=?"
                },
                controller: function ($scope, $rootScope) {
                    $translatePartialLoader.addPart('commons');
                    var periodicity = {
                        month: getCurrentMonth,
                        quarter: getCurrentQuarter(true),
                        season: getCurrentSeason(true)
                    };
                    if (angular.isDefined($rootScope.periodicityActive)) {
                        $scope.periodicityActive = $rootScope.periodicityActive;
                    }
                    if (angular.isDefined($rootScope.periodicityActive)) {
                        $scope.periodicity = $rootScope.periodicity;
                    }

                    if ($scope.periodicityActive && !$scope.periodicityActive.label) {
                        periodicity[$scope.periodicity].call();
                        $scope.currentMonth = function () {
                            getCurrentMonth(true);
                        };
                    }

                    $scope.$watch('meta', function () {
                        if (angular.isDefined($scope.meta) && angular.isDefined($scope.meta.season)) {
                            $scope.periodicity = 'season';
                            $scope.periodicityActive = filterCalendarSrv.getDefault(moment($scope.meta.season.startDate), moment($scope.meta.season.endDate));
                            if (angular.isDefined($rootScope.periodicityActive)) {
                                $scope.periodicityActive = $rootScope.periodicityActive;
                            }
                            if (angular.isDefined($rootScope.periodicityActive)) {
                                $scope.periodicity = $rootScope.periodicity;
                            }
                            updateDatas();
                        }
                    });

                    /**
                     * Update datas
                     */
                    function updateDatas(noUpdt) {
                        if (!noUpdt) {
                            $rootScope.periodicityActive = $scope.periodicityActive;
                            $rootScope.periodicity = $scope.periodicity;
                            qeventbus.prepForBroadcast('periodicityActive', {
                                periodicityActive: $scope.periodicityActive,
                                periodicity: $scope.periodicity,
                                self: 'filterCalendar'
                            });
                        }
                    }

                    $scope.currentMonth = function () {
                        getCurrentMonth(true);
                    };

                    function getCurrentMonth(noUpdt) {
                        $scope.periodicity = 'month';
                        var start = moment('01/' + moment().format('MM/YYYY'), 'DD/MM/YYYY');
                        var end = moment(start).add(1, 'months').subtract(1, 'ms');
                        $scope.periodicityActive = filterCalendarSrv.getMonth(start, end);
                        updateDatas(noUpdt);
                    }

                    $scope.previousMonth = function (noUpdt) {
                        $scope.periodicity = 'month';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').subtract(1, 'month');
                        var end = moment(start).add(1, 'months').subtract(1, 'ms');
                        $scope.periodicityActive = filterCalendarSrv.getMonth(start, end);
                        updateDatas(noUpdt);
                    };

                    $scope.nextMonth = function (noUpdt) {
                        $scope.periodicity = 'month';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').add(1, 'month');
                        var end = moment(start).add(1, 'months').subtract(1, 'ms');
                        $scope.periodicityActive = filterCalendarSrv.getMonth(start, end);
                        updateDatas(noUpdt);
                    };

                    $scope.currentQuarter = function () {
                        getCurrentQuarter(true);
                    };

                    function getCurrentQuarter(noUpdt) {
                        $scope.periodicity = 'quarter';
                        var start = moment('/01/' + filterCalendarSrv.calculateMonth(moment().quarter()) + '/' + moment().year(), 'DD/MM/YYYY');
                        var end = angular.copy(start).add(3, 'month').subtract(1, 'ms');
                        $scope.periodicityActive = filterCalendarSrv.getDefault(start, end);
                        updateDatas(noUpdt);
                    }

                    $scope.previousQuarter = function (noUpdt) {
                        $scope.periodicity = 'quarter';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').subtract(3, 'month');
                        var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').subtract(3, 'month');
                        $scope.periodicityActive = filterCalendarSrv.getDefault(start, end);
                        updateDatas(noUpdt);
                    };

                    $scope.nextQuarter = function (noUpdt) {
                        $scope.periodicity = 'quarter';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').add(3, 'month');
                        var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').add(3, 'month');
                        $scope.periodicityActive = filterCalendarSrv.getDefault(start, end);
                        updateDatas(noUpdt);
                    };

                    $scope.currentSeason = function () {
                        getCurrentSeason(true);
                    };

                    function getCurrentSeason(noUpdt) {
                        $scope.periodicity = 'season';
                        if (angular.isUndefined($scope.meta)) {
                            return;
                        }
                        $scope.periodicityActive = filterCalendarSrv.getDefault(moment($scope.meta.season.startDate), moment($scope.meta.season.endDate));
                        updateDatas(noUpdt);
                    }

                    $scope.previousSeason = function (noUpdt) {
                        $scope.periodicity = 'season';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').subtract(1, 'year');
                        var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').subtract(1, 'year');
                        $scope.periodicityActive = filterCalendarSrv.getDefault(start, end);
                        updateDatas(noUpdt);
                    };

                    $scope.nextSeason = function (noUpdt) {
                        $scope.periodicity = 'season';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').add(1, 'year');
                        var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').add(1, 'year');
                        $scope.periodicityActive = filterCalendarSrv.getDefault(start, end);
                        updateDatas(noUpdt);
                    };
                },
                templateUrl: 'app/components/directives/commons/filter/calendar.html'
            };
        });
}());