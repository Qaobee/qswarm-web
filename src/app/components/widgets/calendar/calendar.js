(function () {
    'use strict';
/**
 * Directive widget calendar<br />
 *
 * Usage :
 *
 * <pre>
 * &lt;widget-calendar events=&quot;eventSources&quot; /&gt;
 * @author Xavier MARIN
 * @class qaobee.directives.widgets.calendar
 * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
 *
 */
angular.module('widget.calendar', ['ui.calendar'])

    .directive('widgetCalendar', function ($filter) {
        'use strict';
        return {
            restrict: 'AE',
            scope: {
                events: '='
            },
            controller: function ($scope) {

                $scope.eventSources = [$scope.events];

                /* alert on eventClick */
                $scope.alertOnEventClick = function (event, allDay, jsEvent, view) {
                    $scope.alertMessage = event.title + ' was clicked ';
                };
                /* alert on Drop */
                $scope.alertOnDrop = function (event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view) {
                    $scope.alertMessage = 'Event Droped to make dayDelta ' + dayDelta;
                };
                /* alert on Resize */
                $scope.alertOnResize = function (event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view) {
                    $scope.alertMessage = 'Event Resized to make dayDelta ' + minuteDelta;
                };
                /* remove event */
                $scope.remove = function (index) {
                    $scope.events.splice(index, 1);
                };
                /* Change View */
                $scope.changeView = function (view, calendar) {
                    calendar.fullCalendar('changeView', view);
                };
                /* Change View */
                $scope.renderCalender = function (calendar) {
                    calendar.fullCalendar('render');
                };

                /* config object */
                $scope.uiConfig = {
                    calendar: {
                        height: 250,
                        editable: false,
                        weekNumbers: true,
                        weekNumberTitle: '',
                        header: {
                            left: '',
                            center: '',
                            right: ''
                        },
                        titleFormat: {
                            month: 'MMMM yyyy',
                            week: "MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}",
                            day: 'dddd, MMM d, yyyy'
                        },
                        columnFormat: {
                            month: 'ddd',
                            week: 'ddd M/d',
                            day: 'dddd M/d'
                        },
                        buttonText: {
                            today: 'today',
                            month: 'month',
                            week: 'week',
                            day: 'day'
                        },
                        firstDay: 0
                    }
                };
                $scope.uiConfig.calendar.titleFormat.month = $filter('translate')('content.calendar.titleformat.month');
                $scope.uiConfig.calendar.titleFormat.week = $filter('translate')('content.calendar.titleformat.week');
                $scope.uiConfig.calendar.titleFormat.day = $filter('translate')();
                $scope.uiConfig.calendar.columnFormat.month = $filter('translate')('content.calendar.columnformat.month');
                $scope.uiConfig.calendar.columnFormat.week = $filter('translate')('content.calendar.columnformat.week');
                $scope.uiConfig.calendar.columnFormat.day = $filter('translate')('content.calendar.columnformat.day');
                $scope.uiConfig.calendar.firstDay = $filter('translate')('content.calendar.firstday');
                $scope.uiConfig.calendar.buttonText.today = $filter('translate')('content.calendar.buttontext.today');
                $scope.uiConfig.calendar.buttonText.month = $filter('translate')('content.calendar.buttontext.month');
                $scope.uiConfig.calendar.buttonText.week = $filter('translate')('content.calendar.buttontext.week');
                $scope.uiConfig.calendar.buttonText.day = $filter('translate')('content.calendar.buttontext.day');
            },
            templateUrl: 'app/components/widgets/calendar/calendar.html'
        };
    });
}());