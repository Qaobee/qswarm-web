(function () {
    'use strict';
    angular.module('qaobee.dashboard.mainPlayer', [
        'qaobee.widgets.agenda',
        'qaobee.widgets.podium',
        'qaobee.widgets.notifications'])

    angular.module('qaobee.widgets.dashboard.mainPlayer', ['qaobee.widgets.agenda', 'qaobee.widgets.podium', 'qaobee.widgets.notifications', 'statsEfficiency'])
        .factory('widgetDefinitionsMainPlayer', function () {
            return {
                get: function () {

                    return [
                        {
                            name: 'Efficacite',
                            directive: 'stats-efficiency',
                            classContent: 'card blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'efficiency.efficiency',
                            attrs: {
                                meta: 'meta',
                                user: 'user',
                                bindToId: 'gaugeEfficiencyGlobal', 
                                label:'efficiencyTotal',
                                padding:'25'
                            },
                            size: {
                                height: '250px',
                                width: '40%'
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
                                height: '250px',
                                width: '60%'
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
                                height: '250px',
                                width: '60%'
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
                                height: '250px',
                                width: '40%'

                            }
                        }
                    ];
                }
            };
        })
        .value('defaultWidgetsMainPlayer', [
            {name: 'notifications'}, 
            {name: 'Top buteurs'},
            {name: 'Temps de jeu'},
            {name: 'Efficacite'}
            
        ]);
})();