(function () {
    'use strict';
    angular.module('qaobee.dashboard.mainPlayer', [
        'qaobee.widgets.agenda',
        'qaobee.widgets.podium',
        'qaobee.widgets.notifications',
        'statsEfficiency'])

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
                            title: 'dashboard.widgetEfficiency.title',
                            icon:'fa fa-dot-circle-o',
                            attrs: {
                                meta: 'meta',
                                user: 'user',
                                bindtoid: 'gaugeEfficiencyGlobal', 
                                label:'efficiencyTotal',
                                padding:'25'
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
                        }
                    ];
                }
            };
        })
        .value('defaultWidgetsMainPlayer', [
            {name: 'Efficacite'},
            {name: 'Top buteurs'},
            {name: 'Temps de jeu'}
        ]);
})();