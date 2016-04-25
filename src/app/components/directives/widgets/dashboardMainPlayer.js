(function () {
    'use strict';
    angular.module('qaobee.dashboard.mainPlayer', [
        'qaobee.widgets.agenda',
        'qaobee.widgets.efficiencyPlayer',
        'qaobee.widgets.efficiencyPlayer9m',
        'qaobee.widgets.efficiencyPlayer7m',
        'qaobee.widgets.efficiencyPlayer6m',
        'qaobee.widgets.podium',
        'qaobee.widgets.notifications',
        'statsEfficiency'])

    angular.module('qaobee.widgets.dashboard.mainPlayer', ['qaobee.widgets.agenda', 'qaobee.widgets.podium', 'qaobee.widgets.notifications', 
                                                           'qaobee.widgets.efficiencyPlayer', 'qaobee.widgets.efficiencyPlayer9m', 'qaobee.widgets.efficiencyPlayer7m', 'qaobee.widgets.efficiencyPlayer6m'])
        .factory('widgetDefinitionsMainPlayer', function () {
            return {
                get: function () {

                    return [
                        {
                            name: 'EfficacitePlayerTotal',
                            directive: 'widget-efficiency-player',
                            classContent: 'card white blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorSecondary white-text',
                            title: 'dashboard.widgetEfficiencyGB.title',
                            icon:'fa fa-dot-circle-o',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                            size: {
                                height: '180px',
                                width: '25%'
                            }
                        }, {
                            name: 'EfficacitePlayer9m',
                            directive: 'widget-efficiency-player-nine',
                            classContent: 'card white blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'dashboard.widgetEfficiencyNine.title',
                            icon:'fa fa-dot-circle-o',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                            size: {
                                height: '180px',
                                width: '25%'
                            }
                        }, {
                            name: 'EfficacitePlayer6m',
                            directive: 'widget-efficiency-player-six',
                            classContent: 'card white blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'dashboard.widgetEfficiencySix.title',
                            icon:'fa fa-dot-circle-o',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                            size: {
                                height: '180px',
                                width: '25%'
                            }
                        }, {
                            name: 'EfficacitePlayer7m',
                            directive: 'widget-efficiency-player-seven',
                            classContent: 'card white blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'dashboard.widgetEfficiencySeven.title',
                            icon:'fa fa-dot-circle-o',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                            size: {
                               height: '180px',
                                width: '25%'
                            }
                        }, {
                            name: 'Top buteurs',
                            directive: 'widget-podium',
                            classContent: 'card white blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorAccent white-text',
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
                                height: '250px',
                                width: '50%'
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
                                height: '250px',
                                width: '50%'
                            }
                        }
                    ];
                }
            };
        })
        .value('defaultWidgetsMainPlayer', [
            {name: 'EfficacitePlayerTotal'},
            {name: 'EfficacitePlayer9m'},
            {name: 'EfficacitePlayer6m'},
            {name: 'EfficacitePlayer7m'},
            {name: 'Temps de jeu'},
            {name: 'Top buteurs'}
        ]);
})();