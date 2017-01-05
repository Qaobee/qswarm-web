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

        .directive('filterCalendar', function ($translatePartialLoader, qeventbus) {
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
                    $scope.$watch('meta', function () {
                        if (!$rootScope.filterCalendar && angular.isDefined($scope.meta) && angular.isDefined($scope.meta.season)) {
                            $scope.periodicity = 'season';
                            $scope.periodicityActive = {
                                label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                                startDate: moment($scope.meta.season.startDate),
                                endDate: moment($scope.meta.season.endDate)
                            };
                            if (angular.isDefined($rootScope.periodicityActive)) {
                                $scope.periodicityActive = $rootScope.periodicityActive;
                            }
                            if (angular.isDefined($rootScope.periodicityActive)) {
                                $scope.periodicity = $rootScope.periodicity;
                            }
                       //     $rootScope.filterCalendar = true;
                            updateDatas();
                        }
                    });

                    function updateDatas() {
                        $rootScope.periodicityActive = $scope.periodicityActive;
                        $rootScope.periodicity = $scope.periodicity;
                        qeventbus.prepForBroadcast('periodicityActive', {
                            periodicityActive: $scope.periodicityActive,
                            periodicity: $scope.periodicity,
                            self: 'filterCalendar'
                        });
                    }

                    if ($scope.periodicityActive && !$scope.periodicityActive.label) {
                        periodicity[$scope.periodicity].call();
                        $scope.currentMonth = function () {
                            getCurrentMonth(true);
                        };
                    }
                    $scope.currentMonth = function () {
                        getCurrentMonth(true);
                    };

                    function getCurrentMonth(noUpdt) {
                        $scope.periodicity = 'month';
                        var start = moment('01/' + moment().format('MM/YYYY'), 'DD/MM/YYYY');
                        var end = moment(start).add(1, 'months').subtract(1, 'ms');
                        $scope.periodicityActive = {
                            label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY'),
                            startDate: start,
                            endDate: end
                        };
                        if (!noUpdt) {
                            updateDatas();
                        }
                    }

                    /* Previous month */
                    $scope.previousMonth = function (noUpdt) {
                        $scope.periodicity = 'month';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').subtract(1, 'month');
                        var end = moment(start).add(1, 'months').subtract(1, 'ms');
                        $scope.periodicityActive = {
                            label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY'),
                            startDate: start,
                            endDate: end
                        };
                        if (!noUpdt) {
                            updateDatas();
                        }
                    };

                    /* Next month */
                    $scope.nextMonth = function (noUpdt) {
                        $scope.periodicity = 'month';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').add(1, 'month');
                        var end = moment(start).add(1, 'months').subtract(1, 'ms');
                        $scope.periodicityActive = {
                            label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY'),
                            startDate: start,
                            endDate: end
                        };
                        if (!noUpdt) {
                            updateDatas();
                        }
                    };

                    $scope.currentQuarter = function () {
                        getCurrentQuarter(true);
                    };

                    function getCurrentQuarter(noUpdt) {
                        $scope.periodicity = 'quarter';
                        var quarter;
                        var currentQuarter = moment().quarter();
                        var year = moment().year();
                        switch (currentQuarter) {
                            case 2:
                                quarter = {
                                    label: moment('01/04/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('/01/07/' + year, 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                                    startDate: moment('/01/04/' + year, 'DD/MM/YYYY'),
                                    endDate: moment('/01/07/' + year, 'DD/MM/YYYY').subtract(1, 'ms')
                                };
                                break;
                            case 3:
                                quarter = {
                                    label: moment('/01/07/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('/01/10/' + year, 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                                    startDate: moment('/01/07/' + year, 'DD/MM/YYYY'),
                                    endDate: moment('/01/10/' + year, 'DD/MM/YYYY').subtract(1, 'ms')
                                };
                                break;
                            case 4:
                                quarter = {
                                    label: moment('/01/10/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('/01/01/' + (year + 1), 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                                    startDate: moment('/01/10/' + year, 'DD/MM/YYYY'),
                                    endDate: moment('/01/01/' + (year + 1), 'DD/MM/YYYY').subtract(1, 'ms')
                                };
                                break;
                            // case 1
                            default:
                                quarter = {
                                    label: moment('01/01/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('01/04/' + year, 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                                    startDate: moment('01/01/' + year, 'DD/MM/YYYY'),
                                    endDate: moment('/01/04/' + year, 'DD/MM/YYYY').subtract(1, 'ms')
                                };
                                break;
                        }
                        $scope.periodicityActive = quarter;
                        if (!noUpdt) {
                            updateDatas();
                        }
                    }

                    $scope.previousQuarter = function (noUpdt) {
                        $scope.periodicity = 'quarter';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').subtract(3, 'month');
                        var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').subtract(3, 'month');
                        $scope.periodicityActive = {
                            label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment(end, 'DD/MM/YYYY').format('MMMM YYYY'),
                            startDate: start,
                            endDate: end
                        };
                        if (!noUpdt) {
                            updateDatas();
                        }
                    };

                    /* Next quarter */
                    $scope.nextQuarter = function (noUpdt) {
                        $scope.periodicity = 'quarter';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').add(3, 'month');
                        var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').add(3, 'month');
                        $scope.periodicityActive = {
                            label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment(end, 'DD/MM/YYYY').format('MMMM YYYY'),
                            startDate: start,
                            endDate: end
                        };
                        if (!noUpdt) {
                            updateDatas();
                        }
                    };

                    $scope.currentSeason = function () {
                        getCurrentSeason(true);
                    };

                    function getCurrentSeason(noUpdt) {
                        $scope.periodicity = 'season';
                        if (angular.isUndefined($scope.meta)) {
                            return;
                        }
                        $scope.periodicityActive = {
                            index: 1,
                            label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                            startDate: moment($scope.meta.season.startDate),
                            endDate: moment($scope.meta.season.endDate)
                        };
                        if (!noUpdt) {
                            updateDatas();
                        }
                    }

                    $scope.previousSeason = function (noUpdt) {
                        $scope.periodicity = 'season';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').subtract(1, 'year');
                        var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').subtract(1, 'year');
                        $scope.periodicityActive = {
                            label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment(end, 'DD/MM/YYYY').format('MMMM YYYY'),
                            startDate: start,
                            endDate: end
                        };
                        if (!noUpdt) {
                            updateDatas();
                        }
                    };

                    $scope.nextSeason = function (noUpdt) {
                        $scope.periodicity = 'season';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').add(1, 'year');
                        var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').add(1, 'year');
                        $scope.periodicityActive = {
                            label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment(end, 'DD/MM/YYYY').format('MMMM YYYY'),
                            startDate: start,
                            endDate: end
                        };
                        if (!noUpdt) {
                            updateDatas();
                        }
                    };
                },
                templateUrl: 'app/components/directives/commons/filter/calendar.html'
            };
        });
}());