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

        .directive('filterCalendar', function ($translatePartialLoader , $log, $q, $filter, qeventbus) {
            return {
                restrict: 'E',
                scope: {
                    periodicity: "=",
                    periodicityActive: "=",
                    meta: "="
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('commons');

                    if ($scope.periodicityActive && !$scope.periodicityActive.label) {
                        if ($scope.periodicity === 'month') {
                            getCurrentMonth();
                        }

                        if ($scope.periodicity === 'quarter') {
                            getCurrentQuarter();
                        }

                        if ($scope.periodicity === 'season') {
                            getCurrentSeason();
                        }

                        /* generate calendar by month */
                        $scope.currentMonth = function () {
                            getCurrentMonth();
                        };
                    }
                    /* generate calendar by month */
                    $scope.currentMonth = function () {
                        getCurrentMonth();
                    };
                    function getCurrentMonth() {
                        $scope.periodicity = 'month';
                        var start = moment('01/' + moment().format('MM/YYYY'), 'DD/MM/YYYY');
                        var end = moment(start).add(1, 'months').subtract(1, 'ms');

                        $scope.periodicityActive = {
                            label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY'),
                            startDate: start,
                            endDate: end
                        };
                    }

                    /* Previous month */
                    $scope.previousMonth = function (/* index */) {
                        $scope.periodicity = 'month';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').subtract(1, 'month');
                        var end = moment(start).add(1, 'months').subtract(1, 'ms');

                        $scope.periodicityActive = {
                            label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY'),
                            startDate: start,
                            endDate: end
                        };
                    };

                    /* Next month */
                    $scope.nextMonth = function (/* index */) {
                        $scope.periodicity = 'month';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').add(1, 'month');
                        var end = moment(start).add(1, 'months').subtract(1, 'ms');

                        $scope.periodicityActive = {
                            label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY'),
                            startDate: start,
                            endDate: end
                        };
                    };

                    /* generate calendar by quarter */
                    $scope.currentQuarter = function () {
                        getCurrentQuarter();
                    };

                    function getCurrentQuarter() {
                        $scope.periodicity = 'quarter';
                        var quarter = {};
                        var currentQuarter = moment().quarter();
                        var year = moment().year();

                        switch (currentQuarter) {
                            case 1:
                                quarter = {
                                    label: moment('01/01/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('01/04/' + year, 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                                    startDate: moment('01/01/' + year, 'DD/MM/YYYY'),
                                    endDate: moment('/01/04/' + year, 'DD/MM/YYYY').subtract(1, 'ms')
                                };
                                break;
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
                            default:
                                quarter = {
                                    label: moment('01/01/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('01/04/' + year, 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                                    startDate: moment('01/01/' + year, 'DD/MM/YYYY'),
                                    endDate: moment('/01/04/' + year, 'DD/MM/YYYY').subtract(1, 'ms')
                                };
                        }

                        /* Current quarter */
                        $scope.periodicityActive = quarter;
                    }

                    /* Previous quarter */
                    $scope.previousQuarter = function () {
                        $scope.periodicity = 'quarter';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').subtract(3, 'month');
                        var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').subtract(3, 'month');

                        $scope.periodicityActive = {
                            label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment(end, 'DD/MM/YYYY').format('MMMM YYYY'),
                            startDate: start,
                            endDate: end
                        };
                    };

                    /* Next quarter */
                    $scope.nextQuarter = function () {
                        $scope.periodicity = 'quarter';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').add(3, 'month');
                        var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').add(3, 'month');

                        $scope.periodicityActive = {
                            label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment(end, 'DD/MM/YYYY').format('MMMM YYYY'),
                            startDate: start,
                            endDate: end
                        };
                    };

                    /* generate calendar by season */
                    $scope.currentSeason = function () {
                        getCurrentSeason();
                    };
                    function getCurrentSeason() {
                        $scope.periodicity = 'season';
                        $scope.periodicityActive = {
                            index: 1,
                            label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                            startDate: moment($scope.meta.season.startDate),
                            endDate: moment($scope.meta.season.endDate)
                        };
                    }

                    /* Previous season */
                    $scope.previousSeason = function () {
                        $scope.periodicity = 'season';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').subtract(1, 'year');
                        var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').subtract(1, 'year');

                        $scope.periodicityActive = {
                            label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment(end, 'DD/MM/YYYY').format('MMMM YYYY'),
                            startDate: start,
                            endDate: end
                        };
                    };

                    /* Next season */
                    $scope.nextSeason = function () {
                        $scope.periodicity = 'season';
                        var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').add(1, 'year');
                        var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').add(1, 'year');

                        $scope.periodicityActive = {
                            label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment(end, 'DD/MM/YYYY').format('MMMM YYYY'),
                            startDate: start,
                            endDate: end
                        };
                    };

                },
                templateUrl: 'app/components/directives/commons/filter/calendar.html'
            };
        });
}());