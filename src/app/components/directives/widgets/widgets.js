(function () {
    'use strict';
    angular.module('qaobee.widgets', ['qaobee.widgets.agenda', 'qaobee.widgets.topStriker'])
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
                                height : '200px'
                            }
                        },{
                            name: 'Top but',
                            directive: 'widget-top-striker',
                            class: 'colorMain white-text',
                            title: 'dashboard.widgetTopScored.title',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                            size: {
                                height : '200px'
                            }
                        }
                    ];
                }
            };
        })
        .value('defaultWidgets', [
            {name: 'agenda'},
            {name: 'Top but'}
        ]);
})();