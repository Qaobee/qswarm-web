(function () {
    'use strict';
    angular.module('qaobee.dashboard.home', [
        'qaobee.widgets.agenda',
        'qaobee.widgets.podium',
        'qaobee.widgets.notifications'])

    angular.module('qaobee.widgets.dashboard.home', ['qaobee.widgets.agenda', 'qaobee.widgets.podium', 'qaobee.widgets.notifications'])
        .factory('widgetDefinitionsHome', function () {
            return {
                get: function () {

                    return [
                        {
                            name: 'agenda',
                            directive: 'widget-calendar',
                            classContent: 'card colorAccent white-text',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'mainAgenda.next_event',
                            icon:'fa fa-calendar',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                            size: {
                                height: '275px',
                                width: '40%'
                            }
                        }, {
                            name: 'Top buteurs',
                            directive: 'widget-podium',
                            classContent: 'card white blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'dashboard.widgetTopScored.title',
                            icon:'fa fa-futbol-o',
                            attrs: {
                                meta: 'meta',
                                user: 'user',
                                indicator: 'goalScored',
                                nbitem: 3,
                                stataggregat: 'COUNT'
                            },
                            size: {
                                height: '275px',
                                width: '60%'
                            }
                        }, {
                            name: 'Temps de jeu',
                            directive: 'widget-podium',
                            classContent: 'card white blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'dashboard.widgetTopUsed.title',
                            icon:'fa fa-hourglass',
                            attrs: {
                                meta: 'meta',
                                user: 'user',
                                indicator: 'playTime',
                                nbitem: 3,
                                stataggregat: 'SUM'
                            },
                            size: {
                                height: '275px',
                                width: '60%'
                            }
                        }, {
                            name: 'notifications',
                            directive: 'widget-notifications',
                            classContent: 'card blue-grey lighten-4 blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'dashboard.widgetNotifications.title',
                            icon:'fa fa-bell',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                             size: {
                                height: '275px',
                                width: '40%'

                            }
                        }
                    ];
                }
            };
        })
        .value('defaultWidgetsHome', [
            {name: 'notifications'}, 
            {name: 'Top buteurs'},
            {name: 'Temps de jeu'},
            {name: 'agenda'}
            
        ]);
})();