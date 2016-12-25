(function () {
    'use strict';
    angular.module('qaobee.dashboard.statsPlayer', [
        'qaobee.widgets.agenda',
        'qaobee.widgets.efficiencyPlayer',
        'qaobee.widgets.podium',
        'qaobee.widgets.notifications',
        'statsEfficiency']);

    angular.module('qaobee.widgets.dashboard.statsPlayer', ['qaobee.widgets.agenda', 'qaobee.widgets.podium', 'qaobee.widgets.notifications',
        'qaobee.widgets.efficiencyPlayer'])
        .factory('widgetDefinitionsStatsPlayer', function () {
            return {
                get: function () {

                    return [
                        {
                            name: 'EfficacitePlayerTotal',
                            directive: 'widget-efficiency-player',
                            classContent: 'card grey lighten-4 red-text text-lighten-1',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'dashboard.widgetEfficiencyGB.title',
                            icon: 'fa fa-dot-circle-o',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                            size: {
                                height: '2O0px',
                                width: '50%'
                            }
                        }, {
                            name: 'EfficacitePlayer9m',
                            directive: 'widget-efficiency-player-nine',
                            classContent: 'card grey lighten-4 blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'dashboard.widgetEfficiencyNine.title',
                            icon: 'fa fa-dot-circle-o',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                            size: {
                                height: '2O0px',
                                width: '25%'
                            }
                        }, {
                            name: 'EfficacitePlayer6m',
                            directive: 'widget-efficiency-player-six',
                            classContent: 'card grey lighten-4 blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'dashboard.widgetEfficiencySix.title',
                            icon: 'fa fa-dot-circle-o',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                            size: {
                                height: '2O0px',
                                width: '25%'
                            }
                        }, {
                            name: 'EfficacitePlayer7m',
                            directive: 'widget-efficiency-player-seven',
                            classContent: 'card grey lighten-4 blue-grey-text text-darken-2',
                            classHeader: 'widget-header card-content colorMain white-text',
                            title: 'dashboard.widgetEfficiencySeven.title',
                            icon: 'fa fa-dot-circle-o',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                            size: {
                                height: '2O0px',
                                width: '25%'
                            }
                        }
                    ];
                }
            };
        })
        .value('defaultWidgetsStatsPlayer', [
            {name: 'EfficacitePlayerTotal'},
            {name: 'EfficacitePlayer9m'},
            {name: 'EfficacitePlayer6m'},
            {name: 'EfficacitePlayer7m'}
        ]);
})();