(function () {
    'use strict';
    angular.module('qaobee.widgets', [
            'qaobee.widgets.agenda',
            'qaobee.widgets.podium',
            'qaobee.widgets.notifications'])

    angular.module('qaobee.widgets.dashboard.home', ['qaobee.widgets.agenda', 'qaobee.widgets.podium'])
        .factory('widgetDefinitions', function () {
            return {
                get: function () {

                    return [
                        {
                            name: 'agenda',
                            directive: 'widget-calendar',
                            classContent: 'card colorAccent white-text',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'mainAgenda.next_event',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                            size: {
                                height: '200px',
                                width: '25%'
                            }
                        }, {
                            name: 'Top buteurs',
                            directive: 'widget-podium',
                            classContent: 'card white blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'dashboard.widgetTopScored.title',
                            attrs: {
                                meta: 'meta',
                                user: 'user',
                                indicator: 'goalScored',
                                nbitem: 3,
                                stataggregat: 'COUNT'
                            },
                            size: {
                                height: '200px',
                                width: '50%'
                            }
                        }, {
                            name: 'Temps de jeu',
                            directive: 'widget-podium',
                            classContent: 'card white blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'dashboard.widgetTopUsed.title',
                            attrs: {
                                meta: 'meta',
                                user: 'user',
                                indicator: 'playTime',
                                nbitem: 3,
                                stataggregat: 'SUM'
                            },
                            size: {
                                height: '200px',
                                width: '50%'
                            }
                        }, {
                            name: 'notifications',
                            directive: 'widget-notifications',
                            classContent: 'card blue-grey lighten-4 blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'dashboard.widgetNotifications.title',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                             size: {
                                height: '200px',
                                width: '25%'
                            }
                        }
                    ];
                }
            };
        })
        .value('defaultWidgets', [
            {name: 'notifications'}, 
            {name: 'Top buteurs'},
            {name: 'agenda'},
            {name: 'Temps de jeu'}
            
            
        ]);
})();