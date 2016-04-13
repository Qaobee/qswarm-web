(function () {
    'use strict';
    angular.module('qaobee.dashboard.mainTeam', [
        'qaobee.widgets.agenda',
        'qaobee.widgets.efficiencyGB',
        'qaobee.widgets.podium',
        'qaobee.widgets.notifications'])

    angular.module('qaobee.widgets.dashboard.mainTeam', ['qaobee.widgets.agenda', 'qaobee.widgets.podium', 'qaobee.widgets.notifications', 'qaobee.widgets.efficiencyGB'])
        .factory('widgetDefinitionsMainTeam', function () {
            return {
                get: function () {

                    return [
                        {
                            name: 'EfficaciteGB',
                            directive: 'widget-efficiency',
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
        .value('defaultWidgetsMainTeam', [
            {name: 'Top buteurs'},
            {name: 'EfficaciteGB'},  
            {name: 'Temps de jeu'}
            
            
        ]);
})();