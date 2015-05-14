/**
 * Module partie privée du site
 *
 * @author Xavier MARIN
 * @class qaobee.prive.prive
 * @namespace qaobee.prive
 *
 * @requires {@link qaobee.prive.profile|qaobee.prive.profile}
 * @requires {@link qaobee.prive.firtsConnectWizzard|qaobee.prive.firtsConnectWizzard}
 * @requires {@link qaobee.prive.effectif.playersheet|qaobee.prive.effectif.playersheet}
 * @requires {@link qaobee.prive.effectif.categories|qaobee.prive.effectif.categories}
 * @requires {@link https://github.com/DataTorrent/malhar-angular-dashboard|ui.dashboard}
 * @requires {@link qaobee.directives.widget.calendar|qaobee.directives.widget.calendar}
 * @requires {@link qaobee.directives.widget.weather|qaobee.directives.widget.weather}
 * @requires {@link qaobee.directives.widget.notifications|qaobee.directives.widget.notification}
 * @requires {@link qaobee.directives.widget.news|qaobee.directives.widget.news}
 * @requires {@link qaobee.rest.prive.profileRestAPI|qaobee.rest.prive.profileRestAPI}
 * @requires {@link qaobee.rest.public.publicRestAPI|qaobee.rest.public.publicRestAPI}
 * @requires {@link qaobee.rest.prive.notificationsRestAPI|qaobee.rest.prive.notificationsRestAPI}
 * @copyright <b>QaoBee</b>.
 */
angular.module(
    'prive',    ['common-config', 'profile', 'firstConnectWizzard','fileread' , 'playersheet', 'composition', 'publicRestAPI', 'profileRestAPI', 'notificationsRestAPI', 'eventbus', 'widget.calendar',
        'widget.weather', 'widget.notifications', 'widget.news', 'widget.structure', 'effectiveMod','cycleMod','categoryTeamsMod', 'categoryTeamsSheetMod','trainingMod','themeMod', 'organizationMod', 'groupMod', 'groupSheetMod', 'exerciseMod',
        'citizenModule','sessionMod', 'ui.sortable', 'themeService','flow'])


    .config(function ($routeProvider, metaDatasProvider) {
        'use strict';

        $routeProvider.when('/private', {
            controller: 'PrivateCtrl',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'templates/prive/welcome.html'
        }).when('/private/notifications', {
            controller: 'NotificationsCtrl',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'templates/prive/profile/notifications.html'
        }).when('/private/calendar', {
            controller: 'CalendarCtrl',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'templates/prive/calendar.html'
        });
    })

/**
 * @class qaobee.prive.prive.PrivateCtrl
 * @description Main controller of templates/prive/welcome.html
 */
    .controller('PrivateCtrl', function ($scope, userInfosAPI, $location, $rootScope, $q, $filter, eventbus, user, meta) {
        'use strict';
        var structureprom = $q.defer();
        var placeprom = $q.defer();
        eventbus.prepForBroadcast("left-menu", 'user.dashboard');
        $scope.$watch(
            function () {
                return $filter('translate')('prive.dashboard.title');
            },
            function (newval) {
                eventbus.prepForBroadcast("title", newval);
            }
        );
        $scope.structureprom = structureprom.promise;
        $scope.placeprom = placeprom.promise;


        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();


        structureprom.resolve(meta.structure);
        $scope.user = user;
        placeprom.resolve(user.address);
        $scope.limit = 5;
        $scope.events = [
            {
                title: 'All Day Event',
                start: new Date(y, m, 1)
            },
            {
                title: 'Long Event',
                start: new Date(y, m, d - 5),
                end: new Date(y, m, d - 2),
                color: "orange"
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: new Date(y, m, d - 3, 16, 0),
                allDay: false
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: new Date(y, m, d + 4, 16, 0),
                allDay: false
            },
            {
                title: 'Birthday Party',
                start: new Date(y, m, d + 1, 19, 0),
                end: new Date(y, m, d + 1, 22, 30),
                allDay: false,
                color: "red"
            },
            {
                title: 'Click for Google',
                start: new Date(y, m, 28),
                end: new Date(y, m, 29),
                color: "green"
            }
        ];

    })

/**
 * @class qaobee.prive.prive.NotificationsCtrl
 * @description Contrôleur principal de la page
 *              templates/prive/profile/notifications.html
 */
    .controller('NotificationsCtrl', function ($scope, notificationsRestAPI, $location, $rootScope, eventbus, $filter, user, meta) {
        'use strict';
        $scope.notifications = [];
        $scope.unreadNum = 0;
        $scope.$on('eventbus', function () {
            if ("refreshNotifications" === eventbus.message) {
                $scope.getNotifications();
            }
        });
        /**
         * @name $scope.getNotifications
         * @function
         * @memberOf qaobee.prive.prive.NotificationsCtrl
         * @description Récupère les notifications d'un user
         */
//        $scope.getNotifications = function () {
//            notificationsRestAPI.getuserNotifications(5).success(function (data) {
//                $scope.unreadNum = data.count(function (n) {
//                    return n.read === false;
//                });
//                $scope.notifications = data;
//            });
//        };
//
//        $scope.getNotifications();

        /**
         * @name $scope.markRead
         * @function
         * @param {String} id id de la notification
         * @memberOf qaobee.prive.prive.NotificationsCtrl
         * @description Marquer la notification comme lue
         */
        $scope.markRead = function (id) {
            var notif = $scope.notifications.find(function (n) {
                return n._id === id;
            });
            notificationsRestAPI.markAsRead(id).success(function (data) {
                notif.read = !notif.read;
                eventbus.prepForBroadcast("refreshNotifications", "");
            });
        };
        /**
         * @name $scope.del
         * @function
         * @param {String} id id de la notification
         * @memberOf qaobee.prive.prive.NotificationsCtrl
         * @description Suppression de la notification
         */
        $scope.del = function (id) {
            var notif = $scope.notifications.find(function (n) {
                return n._id === id;
            });
            modalConfirm($filter('translate')('popup.title.delete.notification'), $filter('translate')('popup.message.delete') + ".<br />" + $filter('translate')('popup.confirm.ask'), function () {
                notificationsRestAPI.del(id).success(function (data) {
                    $scope.notifications.remove(notif);
                    eventbus.prepForBroadcast("refreshNotifications", data);
                    toastr.success(notif.title + $filter('translate')('popup.success.delete'));
                });
            });
        };

    })

/**
 * @class qaobee.prive.prive.CalendarCtrl
 * @description Controller of templates/prive/calendar.html
 */
    .controller('CalendarCtrl', function ($scope, $filter, user, meta) {
        'use strict';
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();
        $scope.events = [
            {
                title: 'All Day Event',
                start: new Date(y, m, 1)
            },
            {
                title: 'Long Event',
                start: new Date(y, m, d - 5),
                end: new Date(y, m, d - 2),
                color: "orange"
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: new Date(y, m, d - 3, 16, 0),
                allDay: false
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: new Date(y, m, d + 4, 16, 0),
                allDay: false
            },
            {
                title: 'Birthday Party',
                start: new Date(y, m, d + 1, 19, 0),
                end: new Date(y, m, d + 1, 22, 30),
                allDay: false,
                color: "red"
            },
            {
                title: 'Click for Google',
                start: new Date(y, m, 28),
                end: new Date(y, m, 29),
                color: "green"
            }
        ];
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
                height: 450,
                editable: true,
                weekNumbers: true,
                weekNumberTitle: '',
                header: {
                    left: 'month agendaWeek agendaDay',
                    center: 'title',
                    right: 'today prev,next'
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
                firstDay: 0,
                eventClick: $scope.alertOnEventClick,
                eventDrop: $scope.alertOnDrop,
                eventResize: $scope.alertOnResize
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

    })
//
;

