(function () {
    'use strict';
    angular.module('qaobee.widgets', [
            'qaobee.widgets.agenda',
            'qaobee.widgets.podium',
            'qaobee.widgets.notifications'])
        .factory('widgetDefinitions', function () {
            return {
                get: function () {

                    return [
                        {
                            name: 'agenda',
                            directive: 'widget-calendar',
                            class: 'blue-grey darken-1 white-text',
                            title: 'mainAgenda.next_event',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                            size: {
                                height: '200px'
                            }
                        }, {
                            name: 'Top buteurs',
                            directive: 'widget-podium',
                            class: 'colorMain white-text',
                            title: 'dashboard.widgetTopScored.title',
                            attrs: {
                                meta: 'meta',
                                user: 'user',
                                indicator: 'goalScored',
                                nbitem: 3,
                                stataggregat: 'COUNT'
                            },
                            size: {
                                height: '200px'
                            }
                        }, {
                            name: 'Temps de jeu',
                            directive: 'widget-podium',
                            class: 'colorMain white-text',
                            title: 'dashboard.widgetTopUsed.title',
                            attrs: {
                                meta: 'meta',
                                user: 'user',
                                indicator: 'playTime',
                                nbitem: 3,
                                stataggregat: 'SUM'
                            },
                            size: {
                                height: '200px'
                            }
                        }, {
                            name: 'notifications',
                            directive: 'widget-notifications',
                            class: 'red white-text',
                            title: 'dashboard.widgetNotifications.title',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                            size: {
                                height: '200px'
                            }
                        }
                    ];
                }
            };
        })
        .value('defaultWidgets', [
            {name: 'agenda'},
            {name: 'Top buteurs'},
            {name: 'Temps de jeu'},
            {name: 'notifications'}
        ]);
})();